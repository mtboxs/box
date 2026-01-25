<script setup lang="ts">
import { getHomeInfo, readNotify } from '@/api/home'
import type { MchRichText } from '@/api/home'
import dayjs from 'dayjs'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const list = ref<MchRichText[]>([])

function isNews(it: MchRichText) {
  return String(it.resourceType) === '3'
}

function formatDate(timestamp: string | number | undefined) {
  if (!timestamp)
    return '-'
  return dayjs(Number(timestamp)).format('YYYY-MM-DD HH:mm:ss')
}

async function load() {
  try {
    loading.value = true
    const res = await getHomeInfo()
    if (res.code === '200')
      list.value = (res.data?.richTexts || []).filter(isNews)
  }
  finally {
    loading.value = false
  }
}

async function openDetail(it: MchRichText) {
  if (it?.id) {
    // 点击列表项时自动标记已读
    try {
      await readNotify(Number(it.id))
    }
    catch {}
    router.push(`/news/${it.id}`)
  }
}

onMounted(async () => {
  await nextTick()
  await load()
})
</script>

<template>
  <div class="bg-[#FFF9F5] min-h-screen">
    <div class="mx-auto px-3 py-3 max-w-[480px]">
      <van-skeleton :loading="loading" :row="8">
        <div v-if="list.length" class="space-y-3">
          <div
            v-for="it in list"
            :key="it.id"
            class="p-4 rounded-2xl bg-white flex gap-3 cursor-pointer shadow-sm items-center active:bg-orange-50"
            @click="openDetail(it)"
          >
            <img v-if="it.coverImg" :src="it.coverImg" class="rounded-xl flex-shrink-0 h-16 w-24 object-cover" alt="">
            <div v-else class="rounded-xl bg-[#FFF3E6] flex flex-shrink-0 h-16 w-24 items-center justify-center">
              <div class="i-carbon:document text-2xl text-[#FF9933]" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-gray-800 font-600 line-clamp-2">
                {{ it.name || '-' }}
              </div>
              <div class="text-xs text-gray-400 mt-1.5">
                {{ formatDate(it.updateAt) }}
              </div>
            </div>
            <div class="i-carbon:chevron-right text-gray-300 flex-shrink-0" />
          </div>
        </div>
        <div v-else class="p-8 rounded-2xl bg-white shadow-sm">
          <div class="text-center">
            <div class="mx-auto mb-4 rounded-full bg-[#FFF3E6] flex h-20 w-20 items-center justify-center">
              <div class="i-carbon:document text-4xl text-[#FF9933]" />
            </div>
            <p class="text-sm text-gray-500">
              {{ t('mock.noData') }}
            </p>
          </div>
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'News'
}
</route>
