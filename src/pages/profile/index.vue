<!-- eslint-disable -->
<script setup lang="ts">
import router from '@/router'
import { useUserStore } from '@/stores'
import { isLogin as hasToken } from '@/utils/auth'
import siteLogo from '@/assets/images/logo.svg'
import siteLogoDark from '@/assets/images/logo-dark.svg'
import { onActivated, onMounted } from 'vue'
import { showToast } from 'vant'
import type { TodayProfitData, TokenDetailData } from '@/api/mine'
import { getTodayProfit, getTokenDetail, updateSellLimit } from '@/api/mine'

const { t } = useI18n()

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const isLogin = computed(() => hasToken())
const dark = computed(() => isDark.value)

function formatNumber(val: any, digits = 2) {
  const num = Number(val ?? 0)
  if (!Number.isFinite(num))
    return digits > 0 ? '0.00' : '0'
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(num)
}

const tokenDetail = ref<TokenDetailData | null>(null)
const loadingMine = ref(false)
const showEventCenter = ref(false)
const todayProfitData = ref<TodayProfitData | null>(null)
const showTodayProfitDialog = ref(false)
const showSellLimitDialog = ref(false)
const sellLimitAmount = ref<number | string>('')
const showTokenDetailDialog = ref(false)
const tgChannelLink = ref('')

const rewardRatioText = computed(() => {
  const raw = Number((userInfo.value as any)?.payerRewardRatio ?? 0)
  const percent = raw <= 1 ? raw * 100 : raw
  return `${percent}%`
})

const todayProfitTotal = computed(() => {
  const d = todayProfitData.value
  const trade = Number(d?.tradeProfit ?? 0)
  const team = Number(d?.teamProfit ?? 0)
  const event = Number(d?.eventReward ?? 0)
  return trade + team + event
})

async function fetchMineData() {
  try {
    await userStore.info()
  }
  catch {}

  try {
    loadingMine.value = true
    const results = await Promise.allSettled([
      getTokenDetail(),
      getTodayProfit(),
    ])
    const [tokenRes, profitRes] = results
    if (tokenRes.status === 'fulfilled' && tokenRes.value.code === '200')
      tokenDetail.value = tokenRes.value.data
    if (profitRes.status === 'fulfilled' && profitRes.value.code === '200')
      todayProfitData.value = profitRes.value.data
  }
  catch {}
  finally {
    loadingMine.value = false
  }
}

onMounted(async () => {
  // 从缓存读取 configs 并查找 tg_channel_link
  const cachedConfigs = localStorage.getItem('app_configs')
  if (cachedConfigs) {
    try {
      const configs = JSON.parse(cachedConfigs)
      const found = configs.find((c: any) => c.paramKey === 'tg_channel_link')
      if (found?.paramValue) {
        tgChannelLink.value = found.paramValue
      }
    }
    catch (e) {
      console.error('Failed to parse cached configs for TG link', e)
    }
  }
  fetchMineData()
})

onActivated(async () => {
  // 每次激活也重新读取一次，确保最新
  const cachedConfigs = localStorage.getItem('app_configs')
  if (cachedConfigs) {
    try {
      const configs = JSON.parse(cachedConfigs)
      const found = configs.find((c: any) => c.paramKey === 'tg_channel_link')
      if (found?.paramValue) {
        tgChannelLink.value = found.paramValue
      }
    }
    catch {}
  }
  fetchMineData()
})

function login() {
  if (isLogin.value)
    return

  router.push({ name: 'Login', query: { redirect: 'Profile' } })
}

function copy(text: string) {
  if (!text)
    return
  navigator.clipboard.writeText(text).then(() => {
    showToast({ type: 'success', message: t('profile.copied') })
  })
}

function goToNewbieRewards() {
  showEventCenter.value = false
  router.push('/rewards/newbie')
}

function goToDailyBuyRewards() {
  showEventCenter.value = false
  router.push('/rewards/daily-buy-inr')
}



function goToOfficialChannel() {
  if (tgChannelLink.value) {
    window.open(tgChannelLink.value, '_blank')
  }
  else {
    // Fallback if no link found
    showToast({ message: 'Channel link not available', type: 'fail' })
  }
}

async function onConfirmUpdateSellLimit() {
  const amount = Number(sellLimitAmount.value)
  if (!Number.isFinite(amount) || amount < 0) {
    showToast({ message: t('settings.enterAmount'), type: 'fail' })
    return
  }
  try {
    const res = await updateSellLimit({ amount })
    if (res.code === '200') {
      showToast({ message: t('settings.updateSuccess'), type: 'success' })
      await userStore.info()
    }
    else {
      showToast({ message: t('settings.updateFailed'), type: 'fail' })
    }
  }
  catch {
    showToast({ message: t('settings.updateFailed'), type: 'fail' })
  }
  finally {
    showSellLimitDialog.value = false
    sellLimitAmount.value = ''
  }
}

async function handleLogout() {
  try {
    await userStore.logout()
  }
  catch (e) {
    console.error('Logout failed:', e)
  }
  finally {
    router.replace('/login')
  }
}
</script>

<template>
  <div class="bg-[#FFF9F5] min-h-screen">
    <!-- User Card -->
    <div class="mx-3 mt-3">
      <div class="p-4 rounded-2xl bg-white shadow-sm" @click="login">
        <div class="flex gap-4 items-center">
          <div class="p-[3px] rounded-full flex-shrink-0 h-18 w-18 shadow-md relative from-[#FF9933] to-[#138808] bg-gradient-to-br">
            <div class="rounded-full bg-white flex h-full w-full items-center justify-center">
              <van-image :src="dark ? siteLogoDark : siteLogo" class="h-14 w-14" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div v-if="isLogin" class="text-lg text-gray-900 font-700 truncate">
              {{ userInfo.username || '-' }}
            </div>
            <div v-else class="text-lg text-gray-900 font-700">
              {{ $t('profile.login') }}
            </div>
            <div v-if="isLogin" class="mt-2 flex flex-wrap gap-2">
              <div class="text-xs text-gray-600 px-2 py-1 rounded-lg bg-[#FFF9F5] flex gap-1 items-center">
                <span>{{ $t('profile.reward') }}:</span>
                <span class="text-[#FF9933] font-600">{{ rewardRatioText }}</span>
              </div>
              <div class="text-xs text-gray-600 px-2 py-1 rounded-lg bg-[#FFF9F5] flex gap-1 items-center">
                <span>ID:</span>
                <span class="text-gray-900">{{ userInfo.uid || '-' }}</span>
              </div>
            </div>
          </div>
          <div v-if="!isLogin" class="i-carbon:chevron-right text-xl text-gray-400" />
        </div>
        <div v-if="isLogin" class="mt-3 px-3 py-2 rounded-xl bg-[#FFF9F5] flex gap-2 items-center">
          <span class="text-sm text-gray-600">{{ $t('profile.inviteCode') }}:</span>
          <span class="text-sm text-[#FF9933] font-600 flex-1 truncate">{{ (userInfo as any).inviteCode || '-' }}</span>
          <button class="text-xs text-white font-500 px-3 py-1.5 rounded-lg bg-[#FF9933]" @click.stop="copy((userInfo as any).inviteCode || '')">
            {{ $t('profile.copy') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Assets Section -->
    <div v-if="isLogin" class="mx-3 mt-3">
      <div class="text-sm text-gray-700 font-600 mb-2 px-1">
        {{ $t('profile.assets') }}
      </div>
      <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between active:bg-orange-50" @click="showTokenDetailDialog = true">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#FFF3E6] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:currency-rupee text-xl text-[#FF9933]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ $t('profile.iToken') }}</span>
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-base text-[#FF9933] font-700">₹{{ formatNumber(tokenDetail?.availableAmount ?? (userInfo as any).bal, 2) }}</span>
            <div class="i-carbon:chevron-right text-gray-400" />
          </div>
        </div>

        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between active:bg-orange-50" @click="showTodayProfitDialog = true">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#F0FDF0] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:money text-xl text-[#138808]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ $t('profile.todayProfit') }}</span>
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-base text-[#138808] font-700">₹{{ formatNumber(todayProfitTotal, 2) }}</span>
            <div class="i-carbon:chevron-right text-gray-400" />
          </div>
        </div>

        <router-link to="/sell/history" class="px-4 py-3 border-b border-gray-100 flex items-center justify-between active:bg-orange-50">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#EBF5FF] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:document text-xl text-[#3B82F6]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ $t('profile.sellHistory') }}</span>
          </div>
          <div class="i-carbon:chevron-right text-gray-400" />
        </router-link>

        <router-link to="/buy/history" class="px-4 py-3 border-b border-gray-100 flex items-center justify-between active:bg-orange-50">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#FFF3E6] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:shopping-cart text-xl text-[#FF9933]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ $t('profile.buyHistory') }}</span>
          </div>
          <div class="i-carbon:chevron-right text-gray-400" />
        </router-link>

        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between active:bg-orange-50" @click="showEventCenter = true">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#FEF3C7] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:gift text-xl text-[#F59E0B]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ $t('profile.eventCenter') }}</span>
          </div>
          <div class="i-carbon:chevron-right text-gray-400" />
        </div>

        <a href="https://vue-zone.github.io/docs/vue3-vant-mobile/" target="_blank" class="px-4 py-3 border-b border-gray-100 flex items-center justify-between active:bg-orange-50">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#F3E8FF] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:video text-xl text-[#9333EA]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ $t('profile.tutorial') }}</span>
          </div>
          <div class="i-carbon:chevron-right text-gray-400" />
        </a>

        <router-link to="/faq" class="px-4 py-3 border-b border-gray-100 flex items-center justify-between active:bg-orange-50">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#E0F7FA] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:help text-xl text-[#06B6D4]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ $t('profile.commonQuestions') }}</span>
          </div>
          <div class="i-carbon:chevron-right text-gray-400" />
        </router-link>

        <div class="px-4 py-3 flex items-center justify-between active:bg-orange-50" @click="goToOfficialChannel">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#F0FDF0] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:chat text-xl text-[#138808]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ $t('profile.officialService') }}</span>
          </div>
          <div class="i-carbon:chevron-right text-gray-400" />
        </div>
      </div>
    </div>

    <!-- 退出登录区域 -->
    <div v-if="isLogin" class="mt-8 mb-6 mx-4 flex flex-col items-center gap-4">
      <span class="text-sm text-gray-400">Current Version: v3.14.0</span>
      <button class="w-full py-3.5 bg-white text-red-500 font-bold rounded-full shadow-sm active:bg-gray-50 transition-colors" @click="handleLogout">
        Sign Out
      </button>
    </div>

    <van-dialog
      v-model:show="showEventCenter"
      :title="t('rewards.eventCenter.title')"
      :show-confirm-button="false"
      :show-cancel-button="false"
    >
      <div class="p-4 space-y-3">
        <button class="text-sm text-[#FF9933] font-500 py-3 border border-[#FFE4CC] rounded-xl bg-[#FFF9F5] flex gap-2 w-full items-center justify-center active:bg-orange-100" @click="goToNewbieRewards">
          <div class="i-carbon:gift text-lg" /> {{ t('rewards.eventCenter.newbie') }}
        </button>
        <!-- <button class="w-full py-3 rounded-xl bg-[#FFF9F5] border border-[#FFE4CC] text-[#FF9933] text-sm font-500 active:bg-orange-100 flex items-center justify-center gap-2" @click="goToLinkUpiRewards">
          <div class="i-carbon:link text-lg" /> {{ t('rewards.eventCenter.linkUpi') }}
        </button> -->
        <button class="text-sm text-[#FF9933] font-500 py-3 border border-[#FFE4CC] rounded-xl bg-[#FFF9F5] flex gap-2 w-full items-center justify-center active:bg-orange-100" @click="goToDailyBuyRewards">
          <div class="i-carbon:currency-rupee text-lg" /> {{ t('rewards.eventCenter.dailyBuy') }}
        </button>
        <div class="pt-2 text-center">
          <button class="text-sm text-gray-500" @click="showEventCenter = false">
            {{ t('rewards.eventCenter.cancel') }}
          </button>
        </div>
      </div>
    </van-dialog>

    <van-dialog
      v-model:show="showTokenDetailDialog"
      :title="t('profile.iTokenDetail')"
      :confirm-button-text="t('register.confirm')"
    >
      <div class="p-4 space-y-3">
        <div class="p-3 rounded-xl bg-[#FFF9F5] flex items-center justify-between">
          <span class="text-sm text-gray-600">{{ t('profile.available') }}</span>
          <span class="text-lg text-[#FF9933] font-700">₹{{ formatNumber(tokenDetail?.availableAmount ?? (userInfo as any).bal, 2) }}</span>
        </div>
        <div class="p-3 rounded-xl bg-[#F0FDF0] flex items-center justify-between">
          <span class="text-sm text-gray-600">{{ t('profile.inSellAmount') }}</span>
          <span class="text-lg text-[#138808] font-700">₹{{ formatNumber(tokenDetail?.inSellAmount ?? 0, 2) }}</span>
        </div>
      </div>
    </van-dialog>

    <van-dialog
      v-model:show="showTodayProfitDialog"
      :title="t('profile.todayProfitDetail')"
      :close-on-click-overlay="false"
      :confirm-button-text="t('profile.close')"
    >
      <div class="p-4 space-y-2">
        <div class="mb-3 p-3 rounded-xl bg-[#FFF9F5] flex items-center justify-between">
          <span class="text-sm text-gray-700 font-500">{{ t('profile.todayProfit') }}</span>
          <span class="text-xl text-[#FF9933] font-700">₹{{ formatNumber(todayProfitTotal, 2) }}</span>
        </div>
        <div class="py-2 border-b border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-600">{{ t('profile.profit.tradeProfit') }} (INR)</span>
          <span class="text-sm text-[#FF9933] font-600">₹{{ formatNumber(todayProfitData?.tradeProfit, 2) }}</span>
        </div>
        <div class="py-2 border-b border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-600">{{ t('profile.profit.teamProfit') }}</span>
          <span class="text-sm text-[#FF9933] font-600">₹{{ formatNumber(todayProfitData?.teamProfit, 2) }}</span>
        </div>
        <div class="py-2 flex items-center justify-between">
          <span class="text-sm text-gray-600">{{ t('profile.profit.eventReward') }}</span>
          <span class="text-sm text-[#FF9933] font-600">₹{{ formatNumber(todayProfitData?.eventReward, 2) }}</span>
        </div>
      </div>
    </van-dialog>

    <van-dialog
      v-model:show="showSellLimitDialog"
      :title="t('profile.setOrderSize')"
      show-cancel-button
      @confirm="onConfirmUpdateSellLimit"
    >
      <div class="p-4 space-y-3">
        <div class="text-sm text-red-600 p-3 rounded-xl bg-red-50">
          {{ t('profile.orderSizeTip') }}
        </div>
        <van-field v-model="sellLimitAmount" :placeholder="t('settings.enterAmount')" type="number" class="!rounded-xl" />
      </div>
    </van-dialog>
  </div>
</template>

<route lang="json5">
{
  name: 'Profile'
}
</route>
