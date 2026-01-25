<script setup lang="ts">
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import { getSellHome } from '@/api/buy'

const { t } = useI18n()

const loading = ref(false)
const refreshing = ref(false)

const iTokenBalance = ref(34.68)
const inTransaction = ref(0)
const todayDeal = ref(0)
const todayTimes = ref(0)
const todaySuccess = ref(0)
const inSell = ref(false)
const inActive = ref(0)
const showTips = ref(false)

onMounted(async () => {
  await nextTick()
  await loadSellHome()
})

async function loadSellHome() {
  loading.value = true
  try {
    const res = await getSellHome()
    if (res.code === '200' && res.data) {
      inActive.value = Number(res.data.inActive) || 0
      inTransaction.value = Number(res.data.inTransaction) || 0
      todayDeal.value = Number(res.data.todayDeal) || 0
      todaySuccess.value = Number(res.data.todaySuccess) || 0
      todayTimes.value = Number(res.data.todayTimes) || 0
    }
  }
  catch {
    showToast({ message: 'Failed to load sell home', type: 'fail' })
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

async function onRefresh() {
  await loadSellHome()
}

function formatNumber(val: any, digits = 2) {
  const num = Number(val)
  if (!Number.isFinite(num))
    return digits > 0 ? '0.00' : '0'
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(num)
}

function goToBuy() {
  router.push('/buy')
}

function goToSellHistory() {
  router.push('/sell')
}

function goToOfficialService() {
  try {
    const configsStr = localStorage.getItem('app_configs')
    if (configsStr) {
      const configs = JSON.parse(configsStr)
      if (configs && configs.kefu) {
        window.location.href = configs.kefu
        return
      }
    }
    showToast('Service URL not configured')
  }
  catch {
    showToast('Failed to get service configuration')
  }
}

function manageUpi() {
  router.push('/upi')
}

function onInSellChange(value: boolean) {
  if (value) {
    showTips.value = true
    inSell.value = false // 恢复到关闭状态
  }
}
</script>

<template>
  <div class="pb-4 bg-[#FFF9F5] min-h-screen">
    <div class="sticky top-0 z-50 w-full">
      <van-nav-bar
        :title="t('sell.title')"
        left-arrow
        @click-left="router.back()"
      />
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="mx-auto px-3 py-3 max-w-[480px]">
        <van-skeleton :loading="loading" :row="10">
          <!-- I Token Balance Card -->
          <div class="mb-3 p-4 rounded-2xl bg-white shadow-sm">
            <div class="flex gap-3 items-center">
              <div class="rounded-full flex shrink-0 h-14 w-14 shadow-md items-center justify-center from-[#138808] to-[#FF9933] bg-gradient-to-br">
                <div class="i-carbon:currency-rupee text-2xl text-white" />
              </div>
              <div class="flex-1">
                <div class="text-base text-gray-700 font-500">
                  {{ t('sell.iToken') }}
                </div>
                <div class="text-3xl text-gray-900 tracking-tight font-700" style="font-variant-numeric: tabular-nums">
                  ₹{{ formatNumber(iTokenBalance, 2) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="mb-3 gap-3 grid grid-cols-2">
            <!-- In transaction -->
            <div class="p-4 rounded-2xl bg-white shadow-sm">
              <div class="mb-2 flex gap-2 items-center">
                <div class="rounded-full bg-[#EBF5FF] flex shrink-0 h-10 w-10 items-center justify-center">
                  <div class="i-carbon:time text-xl text-[#3B82F6]" />
                </div>
                <div class="text-xs text-gray-600 leading-tight">
                  {{ t('sell.stats.inTransaction') }}
                </div>
              </div>
              <div class="text-xl text-[#FF9933] tracking-tight font-700" style="font-variant-numeric: tabular-nums">
                {{ inTransaction }}
              </div>
            </div>

            <!-- Today Deal -->
            <div class="p-4 rounded-2xl bg-white shadow-sm">
              <div class="mb-2 flex gap-2 items-center">
                <div class="rounded-full bg-[#FFF3E6] flex shrink-0 h-10 w-10 items-center justify-center">
                  <div class="i-carbon:currency-rupee text-xl text-[#FF9933]" />
                </div>
                <div class="text-xs text-gray-600 leading-tight">
                  {{ t('sell.stats.todayDeal') }}
                </div>
              </div>
              <div class="text-xl text-[#FF9933] tracking-tight font-700" style="font-variant-numeric: tabular-nums">
                {{ todayDeal }}
              </div>
            </div>

            <!-- Today times -->
            <div class="p-4 rounded-2xl bg-white shadow-sm">
              <div class="mb-2 flex gap-2 items-center">
                <div class="rounded-full bg-[#F3E8FF] flex shrink-0 h-10 w-10 items-center justify-center">
                  <div class="i-carbon:restart text-xl text-[#9333EA]" />
                </div>
                <div class="text-xs text-gray-600 leading-tight">
                  {{ t('sell.stats.todayTimes') }}
                </div>
              </div>
              <div class="text-xl text-[#FF9933] tracking-tight font-700" style="font-variant-numeric: tabular-nums">
                {{ todayTimes }}
              </div>
            </div>

            <!-- Today Success -->
            <div class="p-4 rounded-2xl bg-white shadow-sm">
              <div class="mb-2 flex gap-2 items-center">
                <div class="rounded-full bg-[#F0FDF0] flex shrink-0 h-10 w-10 items-center justify-center">
                  <div class="i-carbon:checkmark-filled text-xl text-[#138808]" />
                </div>
                <div class="text-xs text-gray-600 leading-tight">
                  {{ t('sell.stats.todaySuccess') }}
                </div>
              </div>
              <div class="text-xl text-[#138808] tracking-tight font-700" style="font-variant-numeric: tabular-nums">
                {{ todaySuccess }}
              </div>
            </div>
          </div>

          <!-- In Sell Toggle -->
          <div class="mb-3 px-4 py-3 rounded-2xl bg-white shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex gap-3 items-center">
                <div class="rounded-full bg-[#FFF3E6] flex h-10 w-10 items-center justify-center">
                  <div class="i-carbon:shopping-cart text-xl text-[#FF9933]" />
                </div>
                <div class="text-sm text-gray-900 font-600">
                  {{ t('sell.inSell') }}
                </div>
              </div>
              <van-switch v-model="inSell" size="24px" @update:model-value="onInSellChange" />
            </div>
          </div>

          <!-- Active UPI -->
          <div class="mb-3 p-4 rounded-2xl bg-white shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex gap-3 items-center">
                <div class="rounded-full bg-[#F0FDF0] flex h-10 w-10 items-center justify-center">
                  <div class="i-carbon:link text-xl text-[#138808]" />
                </div>
                <div>
                  <div class="text-sm text-gray-900 font-600">
                    {{ t('sell.inActive') }}: <span class="text-[#138808]">{{ inActive }}</span>
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5">
                    {{ t('sell.activeUpi') }}
                  </div>
                </div>
              </div>
              <button class="text-sm text-white font-500 px-4 py-2 rounded-full bg-[#FF9933] active:bg-[#E68A2E]" @click="manageUpi">
                {{ t('sell.manageUpi') }}
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <!-- Buy IToken -->
            <div
              class="p-4 rounded-2xl bg-white flex cursor-pointer shadow-sm items-center justify-between active:bg-orange-50"
              @click="goToBuy"
            >
              <div class="flex gap-3 items-center">
                <div class="rounded-full flex shrink-0 h-12 w-12 shadow-sm items-center justify-center from-[#138808] to-[#FF9933] bg-gradient-to-br">
                  <div class="i-carbon:currency-rupee text-xl text-white" />
                </div>
                <div class="text-base text-gray-900 font-600">
                  {{ t('sell.buyIToken') }}
                </div>
              </div>
              <div class="i-carbon:chevron-right text-lg text-gray-400" />
            </div>

            <!-- Sell History -->
            <div
              class="p-4 rounded-2xl bg-white flex cursor-pointer shadow-sm items-center justify-between active:bg-orange-50"
              @click="goToSellHistory"
            >
              <div class="flex gap-3 items-center">
                <div class="rounded-full bg-[#EBF5FF] flex shrink-0 h-12 w-12 items-center justify-center">
                  <div class="i-carbon:document text-xl text-[#3B82F6]" />
                </div>
                <div class="text-base text-gray-900 font-600">
                  {{ t('sell.sellHistory') }}
                </div>
              </div>
              <div class="i-carbon:chevron-right text-lg text-gray-400" />
            </div>

            <!-- Official Service -->
            <div
              class="p-4 rounded-2xl bg-white flex cursor-pointer shadow-sm items-center justify-between active:bg-orange-50"
              @click="goToOfficialService"
            >
              <div class="flex gap-3 items-center">
                <div class="rounded-full bg-[#F0FDF0] flex shrink-0 h-12 w-12 items-center justify-center">
                  <div class="i-carbon:chat text-xl text-[#138808]" />
                </div>
                <div class="text-base text-gray-900 font-600">
                  {{ t('sell.officialService') }}
                </div>
              </div>
              <div class="i-carbon:chevron-right text-lg text-gray-400" />
            </div>
          </div>
        </van-skeleton>
      </div>
    </van-pull-refresh>

    <!-- Tips Dialog -->
    <van-dialog
      v-model:show="showTips"
      :title="t('sell.tips.title')"
      :message="t('sell.tips.message')"
      :show-cancel-button="true"
      :cancel-button-text="t('sell.tips.cancel')"
      :confirm-button-text="t('sell.tips.ok')"
      @confirm="showTips = false"
      @cancel="showTips = false"
    />
  </div>
</template>

<route lang="json5">
{
  name: 'stats',
  meta: {
    hideNavbar: true
  }
}
</route>
