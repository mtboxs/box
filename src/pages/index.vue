<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getHomeData, grabbingOrder, getNotice } from '@/api/home'
import type { BrandInfo, ProductInfo } from '@/api/home'
import { showToast } from 'vant'
import { locale } from '@/utils/i18n'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const brands = ref<BrandInfo[]>([])
const products = ref<ProductInfo[]>([])
const loading = ref(false)
const showNotice = ref(false)
const noticeContent = ref('')
const showLangSheet = ref(false)

const langOptions = [
  { name: 'ภาษาไทย (Thai)', value: 'th-TH' },
  { name: '简体中文 (Chinese)', value: 'zh-CN' },
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
      
      products.value = res.data.products || []
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
    const res = await getNotice({ langType: '1' }) 
    if (res.code === '200' && res.data?.richTxt) {
      noticeContent.value = res.data.richTxt
      showNotice.value = true
    }
  } catch (error) {
    console.error('Failed to load notice', error)
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
  { id: 1, brandName: 'Presta Shop', brandLogoUrl: 'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20251206/88e48d92b96a1df5e6b310cd6c9996da.jpg', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 2, brandName: 'APPLE', brandLogoUrl: 'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20250915/596fe8b299a5876fbaf78dd2c641a322.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 3, brandName: 'CHANEL', brandLogoUrl: 'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20250915/4916aa4f9a795010f8886540d2cf99e7.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 4, brandName: 'Electrolux', brandLogoUrl: 'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20250915/d3b6e406979cb4cb00576044bff77d67.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 5, brandName: 'Rolex', brandLogoUrl: 'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20250915/8b6a3da50a3994d39c6f365621025fff.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 6, brandName: 'Louis Vuitton', brandLogoUrl: 'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20250915/6b315a431076ce9be9827e7003edf5ef.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 7, brandName: 'DIOR', brandLogoUrl: 'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20250915/9f2afe1e990ef13684e0263d37acc205.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 8, brandName: 'Celine', brandLogoUrl: 'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20250915/cad234471d972763bd56ebb9f3081119.png', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 9, brandName: 'PHILIPS', brandLogoUrl: 'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20250712/4da9219468e666ab57173ca9edd3b4d2.jpg', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 10, brandName: 'Adidas', brandLogoUrl: 'https://www.thprestashop.store/upload/image/20240103/60892abcf9c13811884f66773a278e32.jpg', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 11, brandName: 'SONY', brandLogoUrl: 'https://www.thprestashop.store/upload/image/20240103/678a0e33476c1d4169be2a58f037e68b.jpg', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
  { id: 12, brandName: 'MSI', brandLogoUrl: 'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20241212/72b7970e28e31f642d09ec21680ceb76.jpg', brandSort: 0, disabled: false, createBy: '', createAt: '', updateAt: '' },
]

// Mock Banners
const banners = [
  'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20251206/f6a379542664a7c8fef6898687b9da87.jpg',
  'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20251206/9b80c2f2775645e32b99724f0085735a.jpg',
  'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20251206/6c5c0a63e0ff75498a1495a60a728739.jpg',
  'https://08-tiki-img.s3.ap-southeast-1.amazonaws.com/image/20251206/675d3819a29f494d94c00931574478fc.jpg'
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
           <img src="https://www.thprestashop.store/static/index/red/images/gouwuche.png" class="w-5 h-5 pointer-events-none" />
        </div>
        <div class="bg-white/80 p-1.5 rounded-full backdrop-blur-sm cursor-pointer z-50 pointer-events-auto" @click.stop="router.push('/profile/chat')">
           <img src="https://www.thprestashop.store/static/index/red/images/kefu.png" class="w-5 h-5 pointer-events-none" />
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
          <div v-for="brand in brands" :key="brand.id" class="flex flex-col items-center justify-center">
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

      <!-- Promo Tiles (Static/Placeholder as per Image 2) -->
      <div class="grid grid-cols-3 gap-3 mb-8">
         <div class="bg-[#FDF6F0] h-24 rounded-lg flex flex-col items-center justify-center p-2">
            <span class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{{ t('home.product') }}</span>
            <div class="font-serif italic text-lg text-gray-800">Presta</div>
            <div class="text-xs font-bold text-gray-400">SHOP</div>
         </div>
         <div class="bg-[#F0F4F8] h-24 rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden">
             <div class="absolute inset-0 bg-gray-200 opacity-50"></div>
             <span class="relative z-10 text-xs font-bold">{{ t('home.newArrival') }}</span>
         </div>
         <div class="bg-[#F5F0F0] h-24 rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden">
             <div class="absolute inset-0 bg-gray-200 opacity-50"></div>
             <span class="relative z-10 text-xs font-bold">{{ t('home.bestSeller') }}</span>
         </div>
      </div>

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
       <div v-for="prod in products" :key="prod.id" class="bg-white rounded-xl p-3 flex gap-4 shadow-sm border border-gray-100">
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
                   <span class="text-red-600 font-bold text-lg">{{ formatCurrency(prod.orderPrice) }}฿</span>
                   <span class="text-gray-400 text-xs line-through">{{ formatCurrency(prod.labelPrice) }}฿</span>
                </div>
                
                <!-- Commission Tag -->
                <div class="flex items-center justify-between">
                   <div class="inline-flex items-center gap-1 bg-gray-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                      <div class="i-carbon:currency-dollar"></div>
                      <span>{{ t('home.commission') }}: {{ formatCurrency(prod.commission) }}฿</span>
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
      class="w-[85vw] max-w-sm !bg-transparent overflow-visible"
    >
      <div class="bg-white rounded-2xl overflow-hidden shadow-2xl relative">
         <div class="p-6 text-center">
            <h3 class="text-lg font-bold mb-4">{{ t('home.notice') }}</h3>
            <div class="text-sm text-gray-600 text-left max-h-[50vh] overflow-y-auto rich-text-content" v-html="noticeContent"></div>
         </div>

         <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
             <button
               @click="showNotice = false"
               class="bg-gradient-to-b from-gray-700 to-black text-white px-8 py-2 rounded-full font-bold shadow-lg text-sm flex items-center gap-2"
             >
                <div class="i-carbon:close-filled"></div>
                {{ t('home.grabOrder') }}
             </button>
         </div>
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
