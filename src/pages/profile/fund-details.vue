<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getFundDetails } from '@/api/mine'
import type { MbrAssetsFlw } from '@/api/mine'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const list = ref<MbrAssetsFlw[]>([])
const page = ref(1)

const formatDate = (timestamp: string | number) => {
  if (!timestamp) return ''
  return dayjs(Number(timestamp)).format('YYYY-MM-DD HH:mm:ss')
}

// Transaction Types Dictionary
const getTypeName = (type: number) => {
  const map: Record<number, string> = {
    0: t('fund.type.0'), // 系统变更增加
    1: t('fund.type.1'), // 系统变更减少
    2: t('fund.type.2'), // 充值
    3: t('fund.type.3'), // 提现
    4: t('fund.type.4'), // 佣金
    5: t('fund.type.5'), // 拼单付款
    6: t('fund.type.6'), // 回购佣金
    7: t('fund.type.7'), // 回购
    8: t('fund.type.8'), // 提现回滚
    9: t('fund.type.9'), // 积分增加
    10: t('fund.type.10'), // 积分减少
  }
  return map[type] || t('fund.transaction')
}

const onLoad = async () => {
  loading.value = true
  try {
    const res = await getFundDetails({ page: page.value, pageSize: 10 })
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

const goBack = () => router.back()
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white text-black px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
      <button @click="goBack" class="p-1">
        <div class="i-carbon:arrow-left text-xl"></div>
      </button>
      <h1 class="text-base font-bold flex-1 text-center mr-6">{{ t('fund.title') }}</h1>
    </div>

    <!-- List -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      :finished-text="t('record.noMore')"
      @load="onLoad"
      class="p-4"
    >
      <div v-if="list.length === 0 && !loading" class="flex flex-col items-center justify-center pt-20 text-gray-400">
         <div class="i-carbon:document-blank text-6xl mb-4 text-gray-200"></div>
         <span class="text-sm">{{ t('record.empty') }}</span>
      </div>

      <div 
        v-for="item in list" 
        :key="item.id"
        class="bg-white p-4 rounded-lg shadow-sm mb-3"
      >
        <div class="flex justify-between items-start mb-2">
           <div class="flex flex-col">
              <span class="font-bold text-gray-800 text-sm">{{ getTypeName(Number(item.type)) }}</span>
              <span class="text-xs text-gray-400 mt-1">{{ formatDate(item.createAt) }}</span>
           </div>
           <span 
             class="font-bold text-lg"
             :class="Number(item.afterAmt) >= Number(item.beforeAmt) ? 'text-red-600' : 'text-green-600'"
           >
             {{ Number(item.afterAmt) >= Number(item.beforeAmt) ? '+' : '-' }}{{ item.amount }}$
           </span>
        </div>
        <div class="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-2 mt-2">
           <span>{{ t('fund.balance') }}: {{ item.afterAmt }}$</span>
           <span>{{ t('fund.no') }} {{ item.flwNo }}</span>
        </div>
      </div>
    </van-list>
  </div>
</template>
