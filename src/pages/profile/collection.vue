<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const list = ref<any[]>([])

const goBack = () => router.back()
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white text-black px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
      <button @click="goBack" class="p-1">
        <div class="i-carbon:arrow-left text-xl"></div>
      </button>
      <h1 class="text-base font-bold flex-1 text-center mr-6">{{ t('profile.collection') }}</h1>
    </div>

    <!-- Empty State -->
    <div class="flex flex-col items-center justify-center pt-32 px-4">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <div class="i-carbon:star text-5xl text-gray-300"></div>
      </div>
      <p class="text-gray-500 text-base mb-2">{{ t('profile.noData') }}</p>
      <p class="text-gray-400 text-sm text-center">{{ t('collection.emptyHint') }}</p>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'Collection',
  meta: {
    hideTabbar: true,
  }
}
</route>
