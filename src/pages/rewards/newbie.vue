<script setup lang="ts">
import { getNewbieReward } from '@/api/mine'
import type { NewbieRewardInfo } from '@/api/mine'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const data = ref<NewbieRewardInfo | null>(null)
const showKindTips = ref(false)

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
    const res = await getNewbieReward()
    if (res.code === '200') {
      data.value = res.data
      showKindTips.value = !(res.data?.done)
    }
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
        <!-- Total Bonus Card -->
        <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div class="p-4 from-[#FF9933] to-[#138808] bg-gradient-to-r">
            <div class="flex items-center justify-between">
              <div class="text-sm text-white/80">
                {{ t('rewards.newbie.totalBonus') }}
              </div>
              <div class="text-xs font-500 px-3 py-1 rounded-full" :class="data.done ? 'bg-white/20 text-white' : 'bg-white text-[#FF9933]'">
                {{ data.done ? t('rewards.newbie.statusDone') : t('rewards.newbie.statusUndone') }}
              </div>
            </div>
            <div class="text-3xl text-white font-700 mt-2">
              ₹{{ formatNumber(data.totalBonus, 2) }}
            </div>
          </div>
        </div>

        <!-- Tasks List -->
        <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div class="divide-gray-100 divide-y">
            <div
              v-for="it in data.items"
              :key="it.sortNo"
              class="p-4 flex cursor-pointer items-center justify-between active:bg-orange-50"
              @click="it.frontUrl && openFrontUrl(it.frontUrl)"
            >
              <div class="flex gap-3 min-w-0 items-center">
                <div class="rounded-full flex flex-shrink-0 h-10 w-10 items-center justify-center" :class="it.done ? 'bg-[#F0FDF0]' : 'bg-[#FFF3E6]'">
                  <div v-if="it.done" class="i-carbon:checkmark-filled text-xl text-[#138808]" />
                  <div v-else class="i-carbon:gift text-xl text-[#FF9933]" />
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
                class="text-sm font-500 px-4 py-2 rounded-xl flex-shrink-0"
                :class="it.done ? 'bg-[#F0FDF0] text-[#138808]' : 'bg-[#FF9933] text-white active:bg-[#E68A2E]'"
              >
                {{ it.done ? t('rewards.newbie.statusDone') : t('rewards.newbie.go') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="p-8 rounded-2xl bg-white shadow-sm">
        <div class="text-center">
          <div class="mx-auto mb-4 rounded-full bg-[#FFF3E6] flex h-20 w-20 items-center justify-center">
            <div class="i-carbon:gift text-4xl text-[#FF9933]" />
          </div>
          <p class="text-sm text-gray-500">
            {{ t('mock.noData') }}
          </p>
        </div>
      </div>
    </van-skeleton>

    <van-dialog
      v-model:show="showKindTips"
      :title="t('rewards.kindTips.title')"
      :message="t('rewards.kindTips.messageUndone')"
      show-cancel-button
    />
  </div>
</template>

<route lang="json5">
{
  name: 'NewbieRewards'
}
</route>
