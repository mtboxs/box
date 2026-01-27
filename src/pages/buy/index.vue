<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getProductList } from '@/api/buy'
import type { ProductInfo } from '@/api/buy'
import { useProductStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()

const goToProduct = (item: ProductInfo) => {
  productStore.setCurrentProduct(item as any)
  router.push(`/product/${item.id}`)
}
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const list = ref<ProductInfo[]>([])
const page = ref(1)
const pageSize = ref(10)
const isRequesting = ref(false) // 防止重复请求

const loadData = async (isRefresh = false) => {
  // 防止重复请求
  if (isRequesting.value) return

  // 立即设置标志，防止后续调用
  isRequesting.value = true

  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    loading.value = true
    
    // Check for brandId in query
    const brandId = route.query.brandId
    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
    }
    
    if (brandId) {
      params.brandId = Number(brandId)
    }

    const res = await getProductList(params)

    if (res.code === '200') {
      const rows = res.data.list || []
      if (isRefresh) {
        list.value = rows
      } else {
        list.value.push(...rows)
      }

      if (rows.length < pageSize.value) {
        finished.value = true
      } else {
        page.value++
      }
    } else {
      finished.value = true
    }
  } catch (error) {
    console.error(error)
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
    isRequesting.value = false
  }
}

const onRefresh = () => {
  loadData(true)
}

const onLoad = () => {
  if (!refreshing.value) {
    loadData()
  }
}

const formatCurrency = (val: number | string) => {
  return Number(val).toFixed(2)
}

const goBack = () => {
  if (route.query.brandId) {
    router.push('/')
  } else {
    router.back()
  }
}

onMounted(() => {
  // van-pull-refresh doesn't automatically trigger refresh on mount unless v-model is true initially, 
  // but we want controlled load.
  // Actually van-list @load triggers initially if immediate-check is true (default).
  // But let's be explicit if needed, or rely on van-list.
  // Given previous code had onMounted call, let's restore it but check if list triggers it.
  // Usually van-list triggers load immediately.
})
</script>

<template>
  <div class="bg-gray-900 min-h-screen pb-20 flex flex-col">
    <!-- Header -->
    <div class="sticky top-0 z-50 bg-gray-900 text-white flex items-center justify-between px-4 py-3 shadow-md">
      <button @click="goBack" class="p-1">
        <div class="i-carbon:chevron-left text-2xl"></div>
      </button>
      <h1 class="text-lg font-bold flex-1 text-center mr-8">สินค้าเพิ่มเติม</h1> <!-- Centered title with margin offset for back button -->
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="min-h-full">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="No more products"
          @load="onLoad"
          class="p-4 space-y-4"
        >
          <div 
            v-for="item in list" 
            :key="item.id" 
            class="bg-white rounded-xl p-3 flex gap-3 shadow-lg relative overflow-hidden active:bg-gray-50 transition-colors cursor-pointer"
            @click="goToProduct(item)"
          >
            <!-- Product Image -->
            <div class="w-28 h-28 bg-gray-50 rounded-lg flex-shrink-0 relative overflow-hidden">
               <img :src="item.pic1Url" class="w-full h-full object-cover" :alt="item.productName" />
               <!-- Optional: Brand overlay if needed, but design puts it in content -->
            </div>

            <!-- Product Details -->
            <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                 <!-- Brand / Official Store -->
                 <div class="flex items-center gap-1 mb-1">
                    <!-- Assuming logo or text, here using simple text based on image -->
                    <span class="text-xs font-bold text-blue-500" v-if="item.brandId">Official Store</span>
                    <!-- You might want to map brandId to name if available or use API data -->
                 </div>
                 
                 <!-- Product Name -->
                 <h3 class="text-sm text-gray-900 font-medium leading-tight line-clamp-2 mb-2">
                   {{ item.productName }}
                 </h3>
              </div>

              <div>
                 <!-- Price Row -->
                 <div class="flex items-baseline gap-2 mb-1">
                    <span class="text-red-600 font-bold text-lg">{{ formatCurrency(item.orderPrice) }}฿</span>
                    <span class="text-gray-400 text-xs line-through">{{ formatCurrency(item.labelPrice) }}฿</span>
                 </div>

                 <!-- Commission Tag -->
                 <div class="inline-flex items-center bg-gray-600 rounded-full px-2 py-0.5 max-w-max">
                    <span class="text-[10px] text-white">ค่าคอมมิชชั่น: {{ formatCurrency(item.commission) }}฿</span>
                 </div>
              </div>
            </div>

            <!-- Share/Action Button (Absolute positioned bottom-right or flex) -->
            <div class="absolute bottom-3 right-3">
               <button 
                 @click.stop="goToProduct(item)"
                 class="w-8 h-8 bg-black rounded-lg flex items-center justify-center active:scale-95 transition-transform"
               >
                  <div class="i-carbon:arrow-up-right text-white text-sm font-bold"></div>
               </button>
            </div>

          </div>
        </van-list>
      </van-pull-refresh>
    </div>

  </div>
</template>

<style scoped>
/* Custom Scrollbar hide if needed */
::-webkit-scrollbar {
  display: none;
}
</style>

<route lang="json5">
{
  name: 'Buy',
}
</route>
