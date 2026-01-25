<!-- eslint-disable -->
<script setup lang="ts">
import { getHomeInfo } from '@/api/home'
import type { MchRichText } from '@/api/home'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const detail = ref<MchRichText | null>(null)
const loading = ref(false)

onMounted(async () => {
  const id = Number((route.params as any).id)
  if (!id) return

  try {
    loading.value = true
    const res = await getHomeInfo()
    if (res.code === '200') {
      const richTexts = res.data?.richTexts || []
      detail.value = richTexts.find(it => it.id === id) || null
    }
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-white min-h-screen flex flex-col">
    <van-nav-bar
      :title="detail?.name || 'Details'"
      left-arrow
      fixed
      :placeholder="false"
      @click-left="router.back()"
    />

    <div class="flex-1 p-4">
      <van-skeleton title :row="10" :loading="loading">
        <div v-if="detail">
          <div class="text-sm text-gray-400 mb-6">{{ detail.updateAt ? new Date(Number(detail.updateAt)).toLocaleString() : '-' }}</div>
          
          <div class="rich-text-content" v-html="detail.content"></div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="i-carbon:document-unknown text-4xl mb-2" />
          <span class="text-sm">Content not found</span>
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<style scoped>
.rich-text-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
  display: block; /* 避免图片下方出现空白间隙 */
}
.rich-text-content :deep(p) {
  margin-bottom: 1em;
  line-height: 1.618; /* 黄金比例行高，阅读更舒适 */
  color: #374151;
  font-size: 16px; /* 适中的正文字号 */
}
.rich-text-content :deep(ul), .rich-text-content :deep(ol) {
  margin-bottom: 1em;
  padding-left: 1.5em;
}
.rich-text-content :deep(li) {
  margin-bottom: 0.5em;
}
</style>

<route lang="json5">
{
  name: 'FaqDetail'
}
</route>