<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getRepurchaseOrders, getRepurchasedOrders } from '@/api/mine'
import type { ProductOrderResponse } from '@/api/mine'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const { t } = useI18n()
const router = useRouter()

const activeTab = ref(0) // 0: Repurchase (To be), 1: Has been repurchased
const loading = ref(false)
const finished = ref(false)
const list = ref<ProductOrderResponse[]>([])
const page = ref(1)
const refreshing = ref(false)

const loadData = async (isRefresh = false) => {
  if (isRefresh) {
    page.value = 1
    finished.value = false
    list.value = []
  }

  loading.value = true
  try {
    const apiFunc = activeTab.value === 0 ? getRepurchaseOrders : getRepurchasedOrders
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
    refreshing.value = false
  }
}

const onTabChange = () => {
  loadData(true)
}

const onRefresh = () => {
  finished.value = false
  loading.value = true
  loadData(true)
}

const formatTime = (time: string | number) => {
  if (!time) return ''
  const timestamp = typeof time === 'string' && /^\d+$/.test(time) ? Number(time) : time
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

const goBack = () => router.back()
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <!-- Header + Tabs -->
    <div class="bg-white sticky top-0 z-20">
      <div class="text-black px-4 py-3 flex items-center">
        <button @click="goBack" class="p-1">
          <div class="i-carbon:arrow-left text-xl"></div>
        </button>
        <h1 class="text-base font-bold flex-1 text-center mr-6">{{ t('repurchase.title') }}</h1>
      </div>

      <van-tabs
        v-model:active="activeTab"
        @change="onTabChange"
        color="#EF4444"
        title-active-color="#EF4444"
        :border="false"
        line-width="30px"
        background="#fff"
      >
        <van-tab :title="t('repurchase.pending')" />
        <van-tab :title="t('repurchase.completed')" />
      </van-tabs>
    </div>

    <!-- Content -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="flex-1">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="list.length > 0 ? t('record.noMore') : ''"
        @load="loadData"
        class="p-4"
      >
        <div v-if="list.length === 0 && !loading" class="flex flex-col items-center justify-center pt-20 text-gray-400">
           <div class="i-carbon:document-blank text-6xl mb-4 text-gray-300"></div>
           <span class="text-sm text-gray-400">{{ t('record.empty') }}</span>
        </div>

        <div 
          v-for="item in list" 
          :key="item.id" 
          class="bg-white rounded-lg p-4 mb-3 shadow-sm"
        >
           <div class="flex justify-between items-start mb-3">
              <span class="text-xs text-gray-500">{{ t('order.orderNo') }}: {{ item.orderNo }}</span>
              <span class="text-xs text-gray-400">{{ formatTime(item.createAt) }}</span>
           </div>
           
           <div class="flex gap-3">
              <div class="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                 <img :src="item.pic1Url" class="w-full h-full object-cover" />
              </div>
              
              <div class="flex-1 min-w-0 flex flex-col justify-between">
                 <h3 class="text-sm font-medium text-gray-900 line-clamp-2">{{ item.productName }}</h3>
                 
                 <div class="flex justify-between items-end mt-2">
                    <div>
                       <div class="text-red-600 font-bold text-base">{{ item.orderPrice }}$</div>
                       <div class="text-xs text-gray-500 mt-1">{{ t('order.commission') }}: {{ item.commission }}$</div>
                    </div>
                    
                    <span v-if="activeTab === 1" class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      {{ t('repurchase.statusCompleted') }}
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>
