<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getHomeData, grabbingOrder, getNotice } from '@/api/home'
import type { BrandInfo, ProductInfo } from '@/api/home'
import { showToast } from 'vant'
import { locale } from '@/utils/i18n'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '@/stores'

const { t } = useI18n()
const router = useRouter()
const productStore = useProductStore()

const goToProduct = (prod: ProductInfo) => {
  productStore.setCurrentProduct(prod)
  router.push(`/product/${prod.id}`)
}
const brands = ref<BrandInfo[]>([])
const products = ref<ProductInfo[]>([])
const loading = ref(false)
const showNotice = ref(true)
const noticeContent = ref('')
const showLangSheet = ref(false)

const langOptions = [
  { name: 'ภาษาไทย (Thai)', value: 'th-TH' },
  { name: 'English', value: 'en-US' },
]

const currentLang = computed(() => {
  if (locale.value.startsWith('th')) return 'TH'
  if (locale.value.startsWith('zh')) return 'CN'
  if (locale.value.startsWith('en')) return 'EN'
  return 'TH'
})

const onSelectLang = (action: any) => {
  if (action.value) {
    locale.value = action.value
    showLangSheet.value = false
    // Reload page to ensure all components/content update if needed, or rely on reactivity
    // For now rely on reactivity as locale is reactive
  }
}

// Watch for locale changes to update page title or other non-reactive parts if any
// But mainly just force re-render or let Vue handle it. 
// For van-tabbar or other global components, they should be reactive.


// Initialize data
onMounted(async () => {
  loadData()
  checkNotice()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getHomeData()
    if (res.code === '200') {
      // Use fallback brands if API returns empty, matching the target site
      if (!res.data.brands || res.data.brands.length === 0) {
        brands.value = mockBrands
      } else {
        brands.value = res.data.brands
      }
      
      // API returns data.list, not data.products
products.value = res.data.list || res.data.products || []
    } else {
       // Fallback to mock brands even if API fails/returns other code, for dev preview
       brands.value = mockBrands
    }
  } catch (error) {
    console.error('Failed to load home data', error)
    brands.value = mockBrands
  } finally {
    loading.value = false
  }
}

const checkNotice = async () => {
  try {
    // Pass '1' for English, '2' for Thai, '3' for Chinese based on locale if needed, 
    // or just pass current locale string and let backend handle or default to '1'
    // Based on API analysis, it seems to expect specific langType.
    // For now using '1' as default or mapping.
    let langType = '1'
    if (locale.value.startsWith('th')) langType = '2'
    if (locale.value.startsWith('zh')) langType = '3'
    
    const res = await getNotice({ langType }) 
    
    // Check if data is array or object based on actual response
    // API def updated to array, but let's be safe
    const data = res.data
    let content = ''
    
    if (Array.isArray(data) && data.length > 0) {
      content = data[0].richTxt
    } else if (data && !Array.isArray(data) && (data as any).richTxt) {
      content = (data as any).richTxt
    }

    if (res.code === '200' && content) {
      noticeContent.value = content
      showNotice.value = true
    } else {
      showNotice.value = false
    }
  } catch (error) {
    console.error('Failed to load notice', error)
    showNotice.value = false
  }
}

const handleGrabbing = async () => {
  try {
    const res = await grabbingOrder()
    if (res.code === '200') {
      showToast({
        type: 'success',
        message: 'Success: ' + (res.msg || 'Order Received'),
      })
      // Refresh data to show potential updates
      loadData()
    } else {
      showToast({
        type: 'fail',
        message: res.msg || 'Failed to grab order',
      })
    }
  } catch (error) {
    showToast({
      type: 'fail',
      message: 'Network error',
    })
  }
}

const formatCurrency = (val: number | string) => {
  return Number(val).toFixed(2)
}

// Mock Brands from target site
const mockBrands: BrandInfo[] = [
  { id: 1, brandName: 'Presta Shop', brandLogoUrl: 'https://img.icons8.com/color/48/prestashop.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 2, brandName: 'PHILIPS', brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Philips_logo.svg/2560px-Philips_logo.svg.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 3, brandName: 'SONY', brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sony_logo.svg/2560px-Sony_logo.svg.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 4, brandName: 'LYN', brandLogoUrl: 'https://www.lynaround.com/media/wysiwyg/lynaround/logo-lynaround.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 5, brandName: 'LINE', brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/1024px-LINE_logo.svg.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 6, brandName: 'Adidas', brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/2560px-Adidas_Logo.svg.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 7, brandName: 'MSI', brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/MSI_Logo.svg/2560px-MSI_Logo.svg.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 8, brandName: 'NIKE', brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/2560px-Logo_NIKE.svg.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
]

// Mock Banners
const banners = [
  new URL('@/assets/images/banner1.jpg', import.meta.url).href,
  new URL('@/assets/images/banner2.jpg', import.meta.url).href,
  new URL('@/assets/images/banner3.jpg', import.meta.url).href,
  new URL('@/assets/images/banner4.jpg', import.meta.url).href,
]

</script>

<route lang="json5">
{
  name: 'Home',
}
</route>

<template>
  <div class="bg-gray-50 min-h-screen pb-24 relative font-sans">
    <!-- Hero Section -->
    <div class="relative h-64 w-full overflow-hidden bg-gray-900">
      <!-- Banner Swipe -->
      <van-swipe :autoplay="3000" indicator-color="white" class="h-full w-full absolute inset-0">
        <van-swipe-item v-for="(img, idx) in banners" :key="idx">
          <img :src="img" class="w-full h-full object-cover opacity-80" />
        </van-swipe-item>
      </van-swipe>
      
      <div class="absolute top-4 right-4 flex gap-2 z-50">
        <div class="bg-white/80 p-1.5 rounded-full backdrop-blur-sm cursor-pointer z-50 pointer-events-auto" @click.stop="router.push('/profile/order-record?tab=participating')">
           <img src="@/assets/images/gouwuche.png" class="w-5 h-5 pointer-events-none" />
        </div>
        <div class="bg-white/80 p-1.5 rounded-full backdrop-blur-sm cursor-pointer z-50 pointer-events-auto" @click.stop="router.push('/profile/chat')">
           <img src="@/assets/images/kefu.png" class="w-5 h-5 pointer-events-none" />
        </div>
        <div class="bg-white/80 p-1.5 rounded-full backdrop-blur-sm cursor-pointer z-50 pointer-events-auto" @click.stop="router.push('/profile')">
           <img src="@/assets/images/icon-me.png" class="w-5 h-5 pointer-events-none" />
        </div>
        <div
          class="bg-white/90 px-2 py-1 rounded text-xs font-bold text-red-600 flex items-center cursor-pointer active:scale-95 transition-transform z-50 pointer-events-auto"
          @click.stop="showLangSheet = true"
        >
          {{ currentLang }}
        </div>
      </div>

      <div class="absolute inset-0 flex flex-col items-center justify-center text-white z-0 pt-8 pointer-events-none">
        <h1 class="text-5xl font-serif italic mb-2 tracking-wide text-shadow">Presta Shop</h1>
        <div class="text-3xl font-light tracking-[0.2em] uppercase">Garcia</div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="relative -mt-6 bg-white rounded-t-[30px] px-5 pt-6 pb-4 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      
      <!-- Partner Section -->
      <div class="mb-6">
        <h2 class="text-base font-bold text-gray-900 mb-4">{{ t('home.crossBorderPartner') }}</h2>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="brand in brands" :key="brand.id" class="flex flex-col items-center justify-center cursor-pointer" @click="router.push(`/buy?brandId=${brand.id}`)">
             <div class="w-16 h-16 rounded-lg bg-gray-50 shadow-sm flex items-center justify-center p-2 border border-gray-100 overflow-hidden relative">
                <img :src="brand.brandLogoUrl" class="w-full h-full object-contain mix-blend-multiply" :alt="brand.brandName" />
             </div>
             <!-- <span class="text-[10px] mt-1 text-gray-500 text-center leading-tight truncate w-full">{{ brand.brandName }}</span> -->
          </div>
          <!-- Fallback if no brands loaded yet -->
          <template v-if="loading && brands.length === 0">
             <div v-for="i in 8" :key="i" class="w-16 h-16 rounded-lg bg-gray-100 animate-pulse"></div>
          </template>
        </div>
      </div>

      <!-- Promo Tiles (Removed) -->
      <!-- <div class="grid grid-cols-3 gap-3 mb-8">
         <div class="h-24 rounded-lg overflow-hidden relative shadow-sm">
            <img src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=2071&auto=format&fit=crop" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-white/20"></div>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
               <span class="text-[8px] font-serif text-black/70 tracking-widest mb-0.5">PRESTA SHOP</span>
               <div class="text-[10px] font-serif italic text-black/50 leading-tight">Korean Fragrances</div>
            </div>
         </div>
         <div class="h-24 rounded-lg overflow-hidden relative shadow-sm bg-[#FDF6F0]">
            <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop" class="w-full h-full object-cover opacity-90" />
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
               <div class="text-[8px] font-bold tracking-widest text-black mb-0.5">PRODUCT</div>
               <div class="text-[8px] font-bold tracking-widest text-black">PRESTA</div>
               <div class="text-[8px] font-bold tracking-widest text-black">SHOP</div>
               <div class="font-serif italic text-sm text-purple-800 mt-1 drop-shadow-sm">Presta Shop</div>
            </div>
         </div>
         <div class="h-24 rounded-lg overflow-hidden relative shadow-sm">
            <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop" class="w-full h-full object-cover" />
            <div class="absolute inset-0 flex flex-col items-center justify-center p-1">
               <div class="font-serif text-[10px] text-black/80 tracking-widest mb-1">PRESTASHOP</div>
            </div>
         </div>
      </div> -->

      <!-- Main Action Button -->
      <div class="mb-8 flex justify-center">
         <button 
           @click="handleGrabbing"
           class="relative group w-full max-w-xs mx-auto"
         >
           <!-- Shadow/Glow -->
           <div class="absolute -inset-1 bg-black rounded-full blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
           
           <!-- Button Body -->
           <div class="relative w-full h-14 bg-gradient-to-b from-[#333] to-black rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] border border-gray-600 active:scale-[0.98] transition-transform overflow-hidden">
             <!-- Glossy highlight -->
             <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
             
             <!-- Content -->
             <div class="flex items-center gap-2 relative z-10">
                <div class="w-2 h-2 rounded-full bg-white"></div>
                <span class="text-lg font-bold text-white tracking-wide">{{ t('home.grabOrder') }}</span>
             </div>
             
             <!-- Right highlight/reflection -->
             <div class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-full blur-md"></div>
           </div>
         </button>
      </div>

    </div>

    <!-- Special Offer Header -->
    <div class="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-3 px-4 text-center text-lg font-bold shadow-md relative z-20 mx-4 rounded-t-xl -mt-4">
       {{ t('home.specialOffer') }}
    </div>

    <!-- Product List -->
    <div class="px-4 pb-20 space-y-3 bg-gray-50 pt-2">
       <div v-for="prod in products" :key="prod.id" class="bg-white rounded-xl p-3 flex gap-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer" @click="goToProduct(prod)">
          <!-- Product Image -->
          <div class="w-24 h-24 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
             <img :src="prod.pic1Url" class="w-full h-full object-cover" :alt="prod.productName" />
          </div>
          
          <!-- Product Info -->
          <div class="flex-1 flex flex-col justify-between py-1 min-w-0">
             <div>
               <div class="flex items-center gap-1 mb-1">
                  <!-- Brand/Store Name (using productName prefix or brandName if joined, here using static or productName) -->
                  <div class="text-blue-500 font-bold text-xs flex items-center gap-1">
                     <div class="i-carbon:store"></div>
                     {{ t('home.officialStore') }}
                  </div>
               </div>
               <h3 class="text-sm text-gray-800 font-medium leading-tight line-clamp-2 mb-2">
                 {{ prod.productName }}
               </h3>
             </div>
             
             <div class="flex flex-col gap-1">
                <div class="flex items-baseline gap-2">
                   <span class="text-red-600 font-bold text-lg">{{ formatCurrency(prod.orderPrice) }}$</span>
                   <span class="text-gray-400 text-xs line-through">{{ formatCurrency(prod.labelPrice) }}$</span>
                </div>
                
                <!-- Commission Tag -->
                <div class="flex items-center justify-between">
                   <div class="inline-flex items-center gap-1 bg-gray-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                      <div class="i-carbon:currency-dollar"></div>
                      <span>{{ t('home.commission') }}: {{ formatCurrency(prod.commission) }}$</span>
                   </div>
                   
                   <button class="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                      <div class="i-carbon:arrow-up-right text-xs"></div>
                   </button>
                </div>
             </div>
          </div>
       </div>

       <!-- Loading State -->
       <div v-if="loading && products.length === 0" class="space-y-3">
          <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-3 flex gap-4 h-32 animate-pulse">
             <div class="w-24 bg-gray-200 rounded-lg"></div>
             <div class="flex-1 py-2 space-y-2">
                <div class="h-4 bg-gray-200 w-3/4 rounded"></div>
                <div class="h-4 bg-gray-200 w-1/2 rounded"></div>
                <div class="mt-auto h-6 bg-gray-200 w-1/3 rounded"></div>
             </div>
          </div>
       </div>
    </div>

    <!-- Notice Dialog -->
    <van-popup 
      v-model:show="showNotice" 
      round 
      class="w-[80vw] !bg-transparent overflow-visible flex flex-col items-center"
      :close-on-click-overlay="false"
    >
      <div class="bg-white rounded-[20px] w-full min-h-[200px] overflow-hidden shadow-2xl relative mb-8 flex flex-col justify-center" v-if="noticeContent">
         <div class="px-8 py-10 flex items-center justify-center">
            <!-- <h3 class="text-xl font-bold mb-6 text-center text-black">{{ t('home.notice') }}</h3> -->
            <div class="text-xl font-medium text-black leading-relaxed rich-text-content text-center w-full" v-html="noticeContent"></div>
         </div>
      </div>
      <div v-else class="flex justify-center items-center p-4 bg-white rounded-xl mb-6">
         <van-loading type="spinner" color="#000" />
      </div>

      <!-- Close Button -->
      <div 
        @click="showNotice = false"
        class="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform bg-black/20 backdrop-blur-sm"
      >
        <div class="i-carbon:close text-white text-2xl"></div>
      </div>
    </van-popup>

    <!-- Language Action Sheet -->
    <van-action-sheet
      v-model:show="showLangSheet"
      :actions="langOptions"
      :cancel-text="t('profile.cancel')"
      :description="t('home.language')"
      close-on-click-action
      @select="onSelectLang"
    />

  </div>
</template>

<style scoped>
.text-shadow {
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
.rich-text-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}
.rich-text-content :deep(p) {
  margin-bottom: 0.5em;
  line-height: 1.6;
}
</style>
