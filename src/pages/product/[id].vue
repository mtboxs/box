<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { getHomeData } from '@/api/home'
import { buyProduct } from '@/api/buy'
import type { ProductInfo } from '@/api/home'
import { useProductStore } from '@/stores'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const product = ref<ProductInfo | null>(null)
const loading = ref(false)

const productImages = computed(() => {
  if (!product.value) return []
  const imgs = []
  
  const cleanUrl = (url: string) => {
    if (!url) return ''
    // Remove backticks, single/double quotes, and whitespace
    return url.replace(/[`'"]+/g, '').trim()
  }

  if (product.value.pic1Url) {
    const url = cleanUrl(product.value.pic1Url)
    if (url) imgs.push(url)
  }
  if (product.value.pic2Url) {
    const url = cleanUrl(product.value.pic2Url)
    if (url) imgs.push(url)
  }
  if (product.value.pic3Url) {
    const url = cleanUrl(product.value.pic3Url)
    if (url) imgs.push(url)
  }
  return imgs
})

const activeSwipe = ref(0)


// Random Activity Data
interface ActivityItem {
  avatar: string
  username: string
}
const activityList = ref<ActivityItem[]>([])

const generateRandomActivity = () => {
  const list: ActivityItem[] = []
  for (let i = 0; i < 3; i++) {
    // Avatar: 1-150.png
    const avatarId = Math.floor(Math.random() * 150) + 1
    const avatar = `${window.location.origin}/${avatarId}.png`
    
    // Username: u****z (random start/end chars)
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const startChar = chars.charAt(Math.floor(Math.random() * chars.length))
    const endChar = chars.charAt(Math.floor(Math.random() * chars.length))
    const username = `${startChar}****${endChar}`
    
    list.push({ avatar, username })
  }
  activityList.value = list
}

const loadProduct = async () => {
  const id = Number((route.params as any).id)
  if (!id) return

  // Check if product data is in store (from list page navigation)
  const storeData = productStore.currentProduct
  if (storeData && storeData.id === id) {
    product.value = storeData
    return
  }

  loading.value = true

  const createFallbackProduct = () => ({
    id,
    brandId: 0,
    productName: 'Product ' + id,
    productDesc: 'Description for product ' + id,
    pic1Url: 'https://via.placeholder.com/300',
    pic2Url: '',
    pic3Url: '',
    labelPrice: 1000,
    orderPrice: 500,
    commission: 50,
    orderNo: 'ORD-' + id,
    specialOffer: true,
    disabled: false,
    createBy: '',
    createAt: '',
    updateAt: ''
  })

  try {
    // In a real app, we would fetch product detail by ID.
    // Here we fetch home data and find the product from the list,
    // or if not found, we use a mock one based on the ID.
    const res = await getHomeData()
    // API returns data.list, not data.products
    const productList = res.data.list || res.data.products
    if (res.code === '200' && productList) {
      const found = productList.find((p: any) => p.id === id)
      if (found) {
        product.value = found
      } else {
        // Fallback mock if not found in list (e.g. refreshed page)
        product.value = createFallbackProduct()
      }
    } else {
      // API returned non-200 or no products, use fallback
      product.value = createFallbackProduct()
    }
  } catch (error) {
    console.error(error)
    // Network error, use fallback
    product.value = createFallbackProduct()
  } finally {
    loading.value = false
  }
}

const handleBuy = async () => {
  if (!product.value) return
  try {
    const res = await buyProduct({ id: product.value.id })
    if (res.code === '200') {
      showToast({ type: 'success', message: res.msg || 'Success' })
    } else {
      showToast({ type: 'fail', message: res.msg || 'Failed' })
    }
  } catch (error) {
    showToast('Network Error')
  }
}

const goBack = () => router.back()
const goHome = () => router.push('/')
const goService = () => router.push('/profile/chat')

const formatCurrency = (val: number | undefined) => {
  return Number(val || 0).toFixed(2)
}

onMounted(() => {
  loadProduct()
  generateRandomActivity()
})
</script>

<template>
  <div class="bg-[#F5F5F5] min-h-screen pb-20 relative">
    <!-- Header -->
    <div class="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
      <div class="bg-black/50 w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer" @click="goBack">
        <div class="i-carbon:arrow-left text-lg"></div>
      </div>
      <div class="bg-black/50 w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer">
        <div class="i-carbon:share text-lg"></div>
      </div>
    </div>

    <!-- Product Image -->
    <div class="bg-white w-full aspect-square relative">
      <van-swipe v-if="productImages.length > 0" class="h-full" style="height: 100%" :autoplay="3000" indicator-color="white" @change="activeSwipe = $event">
        <van-swipe-item v-for="(img, idx) in productImages" :key="idx" class="h-full" style="height: 100%">
          <img :src="img" class="w-full h-full object-contain" />
        </van-swipe-item>
        
        <template #indicator="{ active, total }">
          <div class="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {{ active + 1 }}/{{ total }}
          </div>
        </template>
      </van-swipe>
      <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
         <div v-if="loading" class="animate-pulse w-full h-full bg-gray-300"></div>
         <div v-else class="text-gray-400 text-sm">No Image</div>
      </div>
    </div>

    <!-- Product Info -->
    <div class="bg-white p-4 -mt-4 relative rounded-t-2xl z-0 mb-3">
      <div v-if="product">
        <h1 class="text-lg font-bold text-gray-900 leading-tight mb-3">
          {{ product.productName }}
        </h1>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-red-600">{{ formatCurrency(product.orderPrice) }}฿</span>
            <span class="text-sm text-gray-400 line-through">{{ formatCurrency(product.labelPrice) }}฿</span>
          </div>
          <div class="bg-black text-[#FFD700] text-xs px-3 py-1 rounded-full font-medium">
            {{ t('home.commission') }}: {{ formatCurrency(product.commission) }}฿
          </div>
        </div>
      </div>
      <div v-else class="space-y-2 animate-pulse">
        <div class="h-6 bg-gray-200 w-3/4 rounded"></div>
        <div class="h-8 bg-gray-200 w-1/2 rounded"></div>
      </div>
    </div>

    <!-- Activity Box -->
    <div class="mx-4 bg-white rounded-xl p-4 mb-3 shadow-sm">
      <div class="flex items-center gap-2 mb-4 border-l-4 border-[#E11D48] pl-2">
        <h3 class="font-bold text-gray-900 text-sm">กำลังดำเนินการสั่งซื้อ</h3>
      </div>
      
      <div class="space-y-4">
        <div v-for="(item, idx) in activityList" :key="idx" class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
              <img :src="item.avatar" class="w-full h-full object-cover" />
            </div>
            <span class="font-medium text-sm text-gray-800">{{ item.username }}</span>
          </div>
          <button 
            @click="handleBuy"
            class="bg-black text-white text-xs px-4 py-1.5 rounded-full font-medium active:scale-95 transition-transform"
          >
            ร่วมซื้อสินค้า
          </button>
        </div>
      </div>
    </div>

    <!-- Details -->
    <div class="bg-white p-4 pb-10 min-h-[200px]">
      <h3 class="font-bold text-gray-900 mb-2">รายละเอียด</h3>
      <h4 class="font-bold text-gray-900 text-sm mb-2">คุณสมบัติของสินค้า:</h4>
      <p class="text-sm text-gray-500 leading-relaxed">
        {{ product?.productDesc || 'No description available.' }}
      </p>
    </div>

    <!-- Bottom Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex items-center justify-between z-20 safe-area-pb">
      <div class="flex items-center gap-6 mr-4">
        <div class="flex flex-col items-center gap-0.5 cursor-pointer" @click="goHome">
          <div class="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
             <div class="i-carbon:home text-lg"></div>
          </div>
          <span class="text-[10px] text-gray-500">หน้าแรก</span>
        </div>
        <div class="flex flex-col items-center gap-0.5 cursor-pointer" @click="goService">
          <div class="w-8 h-8 rounded-full flex items-center justify-center">
             <div class="i-carbon:chat text-xl text-black"></div>
          </div>
          <span class="text-[10px] text-gray-500">บริการลูกค้า</span>
        </div>
      </div>
      
      <button 
        @click="handleBuy"
        class="flex-1 bg-black text-white h-11 rounded-full font-bold text-base shadow-lg active:scale-95 transition-transform"
      >
        ร่วมซื้อ
      </button>
    </div>
  </div>
</template>

<style scoped>
.safe-area-pb {
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}
</style>

<route lang="json5">
{
  name: 'ProductDetail',
  meta: {
    hideNavbar: true,
    hideTabbar: true
  }
}
</route>