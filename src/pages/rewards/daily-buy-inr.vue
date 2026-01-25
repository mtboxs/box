<script setup lang="ts">
import { getDailyBuyReward } from '@/api/mine'
import type { DailyBuyInrRewardInfo } from '@/api/mine'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const data = ref<DailyBuyInrRewardInfo | null>(null)
const now = ref(Date.now())

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

const countdownText = computed(() => {
  const d = new Date()
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0).getTime()
  let diff = end - now.value
  if (diff < 0)
    diff = 0
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${pad(h)} : ${pad(m)} : ${pad(s)}`
})

let timer: any
onMounted(async () => {
  try {
    loading.value = true
    const res = await getDailyBuyReward()
    if (res.code === '200')
      data.value = res.data
  }
  finally {
    loading.value = false
  }
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer)
    clearInterval(timer)
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
                {{ t('rewards.dailyBuy.level0Bonus') }}
              </div>
              <div class="text-xl text-[#FF9933] font-700">
                ₹{{ formatNumber(data.receivedReward, 2) }}
              </div>
            </div>
            <div class="p-4 text-center">
              <div class="text-xs text-gray-500 mb-1">
                {{ t('rewards.dailyBuy.buyInrAmount') }}
              </div>
              <div class="text-xl text-[#138808] font-700">
                {{ formatNumber(data.finishedAmount, 0) }}/{{ formatNumber(data.totalAmount, 0) }}
              </div>
            </div>
            <div class="p-4 text-center">
              <div class="text-xs text-gray-500 mb-1">
                {{ t('rewards.dailyBuy.yesterdayRewards') }}
              </div>
              <div class="text-xl text-[#FF9933] font-700">
                ₹{{ formatNumber(data.yesterdayReward, 2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Countdown Card -->
        <div class="p-4 text-center rounded-2xl shadow-sm from-[#FF9933] to-[#138808] bg-gradient-to-r">
          <div class="text-3xl text-white tracking-widest font-700">
            {{ countdownText }}
          </div>
          <div class="text-sm text-white/80 mt-2">
            {{ t('rewards.dailyBuy.reminder') }}
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
                  <div v-else class="i-carbon:shopping-cart text-xl text-[#FF9933]" />
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
                {{ t('rewards.newbie.statusDone') }}
              </button>
              <button
                v-else
                class="text-sm text-white font-500 px-4 py-2 rounded-xl bg-[#FF9933] flex-shrink-0 active:bg-[#E68A2E]"
                @click="it.frontUrl ? openFrontUrl(it.frontUrl) : router.push('/buy')"
              >
                {{ t('rewards.dailyBuy.goBuy') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="p-8 rounded-2xl bg-white shadow-sm">
        <div class="text-center">
          <div class="mx-auto mb-4 rounded-full bg-[#FFF3E6] flex h-20 w-20 items-center justify-center">
            <div class="i-carbon:shopping-cart text-4xl text-[#FF9933]" />
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
  name: 'DailyBuyInrRewards'
}
</route>
