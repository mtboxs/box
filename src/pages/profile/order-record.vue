<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAwaitPayOrders, getCompletedOrders, getRepurchaseOrders } from '@/api/mine'
import type { ProductOrderResponse } from '@/api/mine'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// Tabs: 0 = I initiated, 1 = Participating, 2 = Completed
const activeTab = ref(0)
const loading = ref(false)
const finished = ref(false)
const list = ref<ProductOrderResponse[]>([])
const page = ref(1)

const tabs = computed(() => [
  { title: t('order.initiated'), value: 0 },
  { title: t('order.participating'), value: 1 },
  { title: t('order.completed'), value: 2 }
])

// Map tab to API
const fetchMap = {
  0: getAwaitPayOrders,
  1: getRepurchaseOrders, // Assuming 'Participating' maps to repurchase/pending orders
  2: getCompletedOrders
}

const loadData = async (isRefresh = false) => {
  if (isRefresh) {
    page.value = 1
    finished.value = false
    list.value = []
  }

  loading.value = true
  try {
    const apiFunc = fetchMap[activeTab.value as keyof typeof fetchMap]
    const res = await apiFunc({ page: page.value, pageSize: 10 })
    
    if (res.code === '200') {
      const rows = res.data.list || []
      list.value.push(...rows)
      if (rows.length < 10) {
        finished.value = true
      } else {
        page.value++
      }
    } else {
      finished.value = true
    }
  } catch (error) {
    finished.value = true
  } finally {
    loading.value = false
  }
}

const onTabChange = () => {
  loadData(true)
}

const goBack = () => router.back()

const handleBuy = (item: ProductOrderResponse) => {
  // Logic for 'Buy' button action
  showToast('Proceed to payment...')
}
</script>

<template>
  <div class="bg-gray-900 min-h-screen flex flex-col">
    <!-- Header -->
    <div class="bg-gray-900 text-white px-4 py-3 flex items-center shadow-md z-10">
      <button @click="goBack" class="p-1">
        <div class="i-carbon:chevron-left text-xl"></div>
      </button>
      <h1 class="text-base font-bold flex-1 text-center mr-6">{{ t('order.title') }}</h1>
    </div>

    <!-- Tabs -->
    <van-tabs 
      v-model:active="activeTab" 
      background="#111827" 
      title-active-color="#EF4444" 
      title-inactive-color="#9CA3AF"
      line-width="30px"
      line-height="2px"
      color="#EF4444"
      @change="onTabChange"
      class="sticky top-0 z-10"
    >
      <van-tab v-for="tab in tabs" :key="tab.value" :title="tab.title" />
    </van-tabs>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto bg-[#1A1A1A] p-4 relative">
       <!-- Large background decoration arc -->
       <div class="absolute bottom-0 right-0 w-[80%] h-[60%] bg-[#252525] rounded-tl-full opacity-50 pointer-events-none z-0"></div>

       <van-list
         v-model:loading="loading"
         :finished="finished"
         :finished-text="t('record.noMore')"
         @load="() => loadData()"
         class="relative z-10"
       >
         <div v-if="list.length === 0 && !loading" class="flex flex-col items-center justify-center pt-20 text-gray-500">
             <div class="i-carbon:shopping-cart text-6xl text-white opacity-80 mb-4"></div>
             <div class="text-sm font-medium">{{ t('record.empty') }}</div>
         </div>

         <div 
           v-for="item in list" 
           :key="item.id" 
           class="bg-white rounded-xl p-4 mb-4 shadow-lg relative"
         >
            <div class="text-xs text-gray-500 mb-2">{{ t('order.orderNo') }}:{{ item.orderNo }}</div>
            
            <div class="flex gap-3">
               <div class="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <img :src="item.pic1Url" class="w-full h-full object-cover" />
               </div>
               
               <div class="flex-1 min-w-0 flex flex-col justify-between">
                  <h3 class="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                    {{ item.productName }}
                  </h3>
                  
                  <div class="mt-1">
                     <div class="flex items-baseline gap-2">
                        <span class="text-red-600 font-bold text-lg">{{ item.orderPrice }}฿</span>
                        <span class="text-gray-400 text-xs line-through">{{ item.labelPrice }}฿</span>
                     </div>
                     
                     <div class="inline-block bg-gray-600 rounded-full px-2 py-0.5 mt-1">
                        <span class="text-[10px] text-white">{{ t('order.commission') }}: {{ item.commission }}฿</span>
                     </div>
                     
                     <div class="text-[10px] text-gray-400 mt-1">
                        {{ item.createAt }}
                     </div>
                  </div>
               </div>
            </div>

            <!-- Action Button -->
            <div class="absolute bottom-4 right-4" v-if="activeTab === 0"> <!-- Show Buy button only on 'I initiated'? -->
               <button 
                 @click="handleBuy(item)"
                 class="bg-black text-white text-xs font-bold px-6 py-1.5 rounded-full"
               >
                 {{ t('order.buy') }}
               </button>
            </div>
         </div>
       </van-list>
    </div>
  </div>
</template>

<style scoped>
:deep(.van-tabs__nav) {
  background-color: transparent;
}
:deep(.van-tab--active) {
  font-weight: bold;
}
</style>
