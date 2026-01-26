<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getFundDetails } from '@/api/mine'
import type { MbrAssetsFlw } from '@/api/mine'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const list = ref<MbrAssetsFlw[]>([])
const page = ref(1)

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
              <span class="font-bold text-gray-800 text-sm">{{ item.remark || t('fund.transaction') }}</span>
              <span class="text-xs text-gray-400 mt-1">{{ item.createAt }}</span>
           </div>
           <span 
             class="font-bold text-lg"
             :class="item.amount >= 0 ? 'text-red-600' : 'text-green-600'"
           >
             {{ item.amount >= 0 ? '+' : '' }}{{ item.amount }}
           </span>
        </div>
        <div class="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-2 mt-2">
           <span>{{ t('fund.balance') }}: {{ item.afterAmt }}</span>
           <span>{{ t('fund.no') }} {{ item.flwNo }}</span>
        </div>
      </div>
    </van-list>
  </div>
</template>
