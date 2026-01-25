<script setup lang="ts">
import { getLinkUpiReward } from '@/api/mine'
import type { LinkUpiRewardInfo } from '@/api/mine'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const data = ref<LinkUpiRewardInfo | null>(null)

function formatNumber(val: any, digits = 2) {
  const num = Number(val ?? 0)
  if (!Number.isFinite(num))
    return digits > 0 ? '0.00' : '0'
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(num)
}

function openFrontUrl(url: string) {
  if (!url)
    return
  try {
    const u = String(url)
    if (u.startsWith('http'))
      window.open(u, '_blank')
    else
      router.push(u)
  }
  catch {}
}

onMounted(async () => {
  try {
    loading.value = true
    const res = await getLinkUpiReward()
    if (res.code === '200')
      data.value = res.data
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-3 bg-[#FFF9F5] min-h-screen">
    <van-skeleton :loading="loading" :row="8">
      <div v-if="data" class="space-y-3">
        <!-- Stats Card -->
        <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div class="grid grid-cols-3 divide-gray-100 divide-x">
            <div class="p-4 text-center">
              <div class="text-xs text-gray-500 mb-1">
                {{ t('rewards.linkUpi.totalBonus') }}
              </div>
              <div class="text-xl text-[#FF9933] font-700">
                ₹{{ formatNumber(data.totalBonus, 2) }}
              </div>
            </div>
            <div class="p-4 text-center">
              <div class="text-xs text-gray-500 mb-1">
                {{ t('rewards.linkUpi.doneCount') }}
              </div>
              <div class="text-xl text-[#138808] font-700">
                {{ data.doneCnt }}/{{ data.items.length }}
              </div>
            </div>
            <div class="p-4 text-center">
              <div class="text-xs text-gray-500 mb-1">
                {{ t('rewards.linkUpi.receivedBonus') }}
              </div>
              <div class="text-xl text-[#FF9933] font-700">
                ₹{{ formatNumber(data.receivedBonus, 2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Tasks List -->
        <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div class="divide-gray-100 divide-y">
            <div
              v-for="it in data.items"
              :key="it.sortNo"
              class="p-4 flex items-center justify-between"
            >
              <div class="flex gap-3 min-w-0 items-center">
                <div class="rounded-full flex flex-shrink-0 h-10 w-10 items-center justify-center" :class="it.done ? 'bg-[#F0FDF0]' : 'bg-[#FFF3E6]'">
                  <div v-if="it.done" class="i-carbon:checkmark-filled text-xl text-[#138808]" />
                  <div v-else class="i-carbon:link text-xl text-[#FF9933]" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm text-gray-900 font-600 truncate">
                    {{ it.title }}
                  </div>
                  <div class="text-sm text-[#FF9933] font-600">
                    ₹{{ formatNumber(it.rewardAmt, 2) }}
                  </div>
                </div>
              </div>
              <button
                v-if="it.done"
                class="text-sm text-[#138808] font-500 px-4 py-2 rounded-xl bg-[#F0FDF0] flex-shrink-0"
              >
                {{ t('rewards.linkUpi.done') }}
              </button>
              <button
                v-else
                class="text-sm text-white font-500 px-4 py-2 rounded-xl bg-[#FF9933] flex-shrink-0 active:bg-[#E68A2E]"
                @click="it.frontUrl && openFrontUrl(it.frontUrl)"
              >
                {{ t('rewards.linkUpi.linkUpi') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="p-8 rounded-2xl bg-white shadow-sm">
        <div class="text-center">
          <div class="mx-auto mb-4 rounded-full bg-[#FFF3E6] flex h-20 w-20 items-center justify-center">
            <div class="i-carbon:link text-4xl text-[#FF9933]" />
          </div>
          <p class="text-sm text-gray-500">
            {{ t('mock.noData') }}
          </p>
        </div>
      </div>
    </van-skeleton>
  </div>
</template>

<route lang="json5">
{
  name: 'LinkUpiRewards'
}
</route>
