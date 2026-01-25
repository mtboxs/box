<!-- eslint-disable -->
<script setup lang="ts">
import { getHomeInfo } from '@/api/home'
import type { MchRichText } from '@/api/home'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const tutorials = ref<MchRichText[]>([])
const loading = ref(false)

onMounted(async () => {
  try {
    loading.value = true
    const res = await getHomeInfo()
    if (res.code === '200') {
      const richTexts = res.data?.richTexts || []
      // 筛选 resourceType = 4 的教程
      tutorials.value = richTexts.filter(it => String(it.resourceType) === '4').sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0))
    }
  }
  finally {
    loading.value = false
  }
})

function goDetail(id: number | undefined) {
  if (id) {
    router.push(`/faq/${id}`)
  }
}
</script>

<template>
  <div class="bg-[#F8F9FA] min-h-screen">
    <van-nav-bar
      title="Common Questions"
      left-arrow
      fixed
      :placeholder="false"
      @click-left="router.back()"
    />

    <div class="p-4 ">
      <van-skeleton title :row="3" :loading="loading">
        <div v-if="tutorials.length > 0" class="space-y-3">
          <div
            v-for="item in tutorials"
            :key="item.id"
            class="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between active:bg-gray-50"
            @click="goDetail(item.id)"
          >
            <div class="flex gap-3 items-center flex-1 mr-4">
              <div v-if="item.coverImg" class="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <img :src="item.coverImg" class="w-full h-full object-cover" alt="">
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-gray-800 font-500 text-sm mb-1 truncate">
                  {{ item.name }}
                </div>
                <div class="text-xs text-gray-400 truncate">
                  {{ item.updateAt ? new Date(Number(item.updateAt)).toLocaleString() : '-' }}
                </div>
              </div>
            </div>
            <div class="i-carbon:chevron-right text-gray-400" />
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="i-carbon:document-unknown text-4xl mb-2" />
          <span class="text-sm">No questions available</span>
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'Faq'
}
</route>
