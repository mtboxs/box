<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRechargeRecords } from '@/api/mine'
import type { MbrRechargeRecord } from '@/api/mine'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const finished = ref(false)
const list = ref<MbrRechargeRecord[]>([])
const page = ref(1)

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
        <div class="flex justify-between items-center mb-2">
          <span class="font-bold text-gray-800">{{ item.recNo }}</span>
          <span class="text-xs text-gray-500">{{ item.createAt }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-red-600 font-bold text-lg">+{{ item.amount }}</span>
          <span 
            class="text-xs px-2 py-1 rounded"
            :class="{
              'bg-yellow-100 text-yellow-700': item.status === '0',
              'bg-green-100 text-green-700': item.status === '1',
              'bg-red-100 text-red-700': item.status === '2'
            }"
          >
            {{ item.status === '1' ? t('record.success') : (item.status === '2' ? t('record.failed') : t('record.pending')) }}
          </span>
        </div>
      </div>
    </van-list>
  </div>
</template>
