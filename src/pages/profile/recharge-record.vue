<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getRechargeRecords } from '@/api/mine'
import type { MbrRechargeRecord } from '@/api/mine'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const list = ref<MbrRechargeRecord[]>([])
const page = ref(1)

const formatDate = (timestamp: string | number) => {
  if (!timestamp) return ''
  return dayjs(Number(timestamp)).format('YYYY-MM-DD HH:mm:ss')
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    '0': t('record.pending'),
    '1': t('record.success'),
    '2': t('record.failed')
  }
  return map[status] || t('record.pending')
}

const onLoad = async () => {
  loading.value = true
  try {
    const res = await getRechargeRecords({ page: page.value, pageSize: 10 })
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
      <h1 class="text-base font-bold flex-1 text-center mr-6">{{ t('record.rechargeTitle') }}</h1>
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
        <div class="flex justify-between items-start mb-4">
          <span class="font-bold text-gray-800 break-all pr-4">{{ item.recNo }}</span>
          <div class="flex flex-col items-end min-w-[80px]">
             <span class="text-xs text-gray-400">{{ formatDate(item.createAt).split(' ')[0] }}</span>
             <span class="text-xs text-gray-400">{{ formatDate(item.createAt).split(' ')[1] }}</span>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-red-600 font-bold text-lg">+{{ item.amount }}$</span>
          <span 
            class="text-xs px-2 py-1 rounded"
            :class="{
              'text-yellow-600': item.status === '0',
              'text-green-600': item.status === '1',
              'text-red-600': item.status === '2'
            }"
          >
            {{ getStatusText(item.status) }}
          </span>
        </div>
      </div>
    </van-list>
  </div>
</template>
