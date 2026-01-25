<script setup lang="ts">
import { getHomeInfo, readNotify } from '@/api/home'
import type { MchRichText } from '@/api/home'
import dayjs from 'dayjs'

const { t } = useI18n()
const route = useRoute()

const loading = ref(false)
const data = ref<MchRichText | null>(null)

const id = computed(() => {
  const params = route.params as any
  const v = Number(params.id)
  return Number.isFinite(v) ? v : 0
})

function isNews(it: MchRichText) {
  return String(it.resourceType) === '3'
}

function formatTime(val: string | number | undefined) {
  if (!val) {
    return '-'
  }
  return dayjs(Number(val)).format('YYYY-MM-DD HH:mm:ss')
}

async function load() {
  if (!id.value) {
    data.value = null
    return
  }

  try {
    loading.value = true
    const res = await getHomeInfo()
    if (res.code === '200') {
      const items = res.data?.richTexts || []
      data.value = items.find(it => isNews(it) && Number(it.id) === id.value) || null

      // 提交已读
      if (data.value?.id) {
        await readNotify(data.value.id)
      }
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  await nextTick()
  await load()
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="mx-auto p-2 max-w-[520px]">
      <van-skeleton :loading="loading" row="10">
        <div v-if="data" class="p-3 border border-gray-100 rounded-xl bg-white">
          <div class="text-base text-gray-900 font-700">
            {{ data.name || '-' }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ formatTime(data.updateAt) }}
          </div>

          <img v-if="data.coverImg" :src="data.coverImg" class="mt-3 rounded-lg w-full" alt="">

          <div class="text-sm text-gray-700 leading-relaxed mt-3">
            <div v-if="data.content" v-html="data.content" />
            <div v-else class="text-gray-400">
              {{ t('mock.noData') }}
            </div>
          </div>
        </div>

        <div v-else class="p-4 rounded-xl bg-white">
          <van-empty :description="t('mock.noData')" />
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'NewsDetail'
}
</route>
