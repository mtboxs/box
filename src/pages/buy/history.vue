<script setup lang="ts">
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import type { MbrPayOutTask, MbrUsdtBuyRecord } from '@/api/buy'
import { getInrCancelHistory, getInrHistory, getInrLockHistory, getUsdtHistory } from '@/api/buy'
import { formatTime } from '@/utils/date'
import { dictLabel } from '@/utils/dict'

const { t } = useI18n()

const activeTab = ref<'inr' | 'cancel' | 'locked' | 'usdt'>('inr')
const loading = ref(false)
const refreshing = ref(false)

// 分页
const page = ref(1)
const pageSize = ref(10)
const totalPage = ref(1)

// 列表数据
const inrHistoryList = ref<MbrPayOutTask[]>([])
const inrCancelList = ref<MbrPayOutTask[]>([])
const inrLockList = ref<MbrPayOutTask[]>([])
const usdtHistoryList = ref<MbrUsdtBuyRecord[]>([])

onMounted(async () => {
  // 使用 nextTick 延迟数据加载，让页面先渲染
  await nextTick()
  await loadCurrent()
})

watch(activeTab, async () => {
  page.value = 1
  await loadCurrent()
})

async function loadCurrent() {
  if (activeTab.value === 'inr') {
    await loadInrHistory()
  }
  else if (activeTab.value === 'cancel') {
    await loadInrCancelHistory()
  }
  else if (activeTab.value === 'locked') {
    await loadInrLockHistory()
  }
  else {
    await loadUsdtHistory()
  }
}

async function onRefresh() {
  try {
    page.value = 1
    await loadCurrent()
  }
  finally {
    refreshing.value = false
  }
}

async function loadInrHistory() {
  loading.value = true
  try {
    const res = await getInrHistory({ page: page.value, pageSize: pageSize.value })
    if (res.code === '200') {
      inrHistoryList.value = res.data.list || []
      totalPage.value = res.data.totalPage || 1
    }
  }
  catch {
    showToast({ message: t('buyHistory.toast.loadFail'), type: 'fail' })
  }
  finally {
    loading.value = false
  }
}

async function loadInrCancelHistory() {
  loading.value = true
  try {
    const res = await getInrCancelHistory({ page: page.value, pageSize: pageSize.value })
    if (res.code === '200') {
      inrCancelList.value = res.data.list || []
      totalPage.value = res.data.totalPage || 1
    }
  }
  catch {
    showToast({ message: t('buyHistory.toast.loadFail'), type: 'fail' })
  }
  finally {
    loading.value = false
  }
}

async function loadInrLockHistory() {
  loading.value = true
  try {
    const res = await getInrLockHistory({ page: page.value, pageSize: pageSize.value })
    if (res.code === '200') {
      inrLockList.value = res.data.list || []
      totalPage.value = res.data.totalPage || 1
    }
  }
  catch {
    showToast({ message: t('buyHistory.toast.loadFail'), type: 'fail' })
  }
  finally {
    loading.value = false
  }
}

async function loadUsdtHistory() {
  loading.value = true
  try {
    const res = await getUsdtHistory({ page: page.value, pageSize: pageSize.value })
    if (res.code === '200') {
      usdtHistoryList.value = res.data.list || []
      totalPage.value = res.data.totalPage || 1
    }
  }
  catch {
    showToast({ message: t('buyHistory.toast.loadFail'), type: 'fail' })
  }
  finally {
    loading.value = false
  }
}

function formatDate(val: string) {
  return formatTime(val)
}

function formatInr(val: any, digits = 2) {
  const num = Number(val)
  if (!Number.isFinite(num))
    return '0.00'
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(num)
}

// 状态颜色映射
function getStatusColor(status: number | string) {
  const s = Number(status)
  const colors: Record<number, string> = {
    0: 'text-gray-500', // Initialized
    1: 'text-orange-500', // To Be Processed
    2: 'text-blue-500', // Processing
    3: 'text-gray-400', // Closed
    4: 'text-green-500', // Success
    5: 'text-red-500', // Failed
  }
  return colors[s] || 'text-gray-500'
}

function getStatusBg(status: number | string) {
  const s = Number(status)
  const colors: Record<number, string> = {
    0: 'bg-gray-50',
    1: 'bg-orange-50',
    2: 'bg-blue-50',
    3: 'bg-gray-50',
    4: 'bg-green-50',
    5: 'bg-red-50',
  }
  return colors[s] || 'bg-gray-50'
}

const showDetail = ref(false)
const detailType = ref<'inr' | 'cancel' | 'usdt'>('inr')
const detailData = ref<any>(null)

function openDetail(item: any, type: 'inr' | 'cancel' | 'usdt') {
  detailType.value = type
  detailData.value = item
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  detailData.value = null
}

// 判断是否可以唤醒银行 App (payTaskStatus: 0=初始化, 1=待处理, 2=处理中)
function canOpenBankApp() {
  if (detailType.value === 'usdt')
    return false
  const status = Number(detailData.value?.payTaskStatus)
  return [0, 1, 2].includes(status)
}

function openBankApp() {
  if (detailType.value === 'usdt')
    return

  const upiId = detailData.value?.upiNo || detailData.value?.upiAccount || ''
  const amount = detailData.value?.taskAmt || ''
  const name = detailData.value?.realName || ''
  const taskNo = detailData.value?.taskNo || ''

  if (!upiId) {
    showToast({ message: 'UPI account not found', type: 'fail' })
    return
  }

  // 构建 UPI Intent URL
  const params = new URLSearchParams()
  params.set('pa', upiId)
  if (name)
    params.set('pn', name)
  if (amount)
    params.set('am', String(amount))
  params.set('cu', 'INR')
  if (taskNo)
    params.set('tn', taskNo)

  const upiUrl = `upi://pay?${params.toString()}`

  // 尝试唤醒 UPI 应用
  window.location.href = upiUrl
}
</script>

<template>
  <div class="bg-[#FFF9F5] min-h-screen">
    <van-pull-refresh v-model="refreshing" class="min-h-screen" @refresh="onRefresh">
      <!-- 内容 -->
      <div class="mx-auto px-3 py-3 max-w-[480px]">
        <!-- 顶部标签 -->
        <div class="mb-3 p-1 rounded-2xl bg-white flex shadow-sm items-center">
          <button
            class="text-sm font-500 py-2.5 rounded-xl flex-1 transition-all"
            :class="[activeTab === 'inr' ? 'bg-[#FF9933] text-white shadow-sm' : 'text-gray-600']"
            @click="activeTab = 'inr'"
          >
            {{ t('buyHistory.tabs.inrLock') }}
          </button>
          <button
            class="text-sm font-500 py-2.5 rounded-xl flex-1 transition-all"
            :class="[activeTab === 'cancel' ? 'bg-[#FF9933] text-white shadow-sm' : 'text-gray-600']"
            @click="activeTab = 'cancel'"
          >
            {{ t('buyHistory.tabs.inrCancel') }}
          </button>
          <button
            class="text-sm font-500 py-2.5 rounded-xl flex-1 transition-all"
            :class="[activeTab === 'usdt' ? 'bg-[#FF9933] text-white shadow-sm' : 'text-gray-600']"
            @click="activeTab = 'usdt'"
          >
            {{ t('buyHistory.tabs.usdt') }}
          </button>
        </div>

        <!-- USDT 提示条 -->
        <div v-if="activeTab === 'usdt'" class="mb-3 p-3 border border-[#FFE4CC] rounded-xl bg-[#FFF3E6] flex gap-2 items-center">
          <div class="i-carbon:information text-lg text-[#FF9933]" />
          <p class="text-xs">
            <span class="text-gray-700">{{ t('buyHistory.usdt.tip1') }}</span>
            <span class="text-red-600 font-600 ml-1">{{ t('buyHistory.usdt.tip2') }}</span>
          </p>
        </div>

        <!-- 主内容区：保证分页固定到底部，同时空态在视窗中居中 -->
        <div class="pb-20 flex flex-col" style="min-height: calc(100vh - 200px);">
          <!-- 列表：INR 历史 -->
          <div v-if="activeTab === 'inr'" class="flex flex-1 flex-col">
            <van-skeleton :loading="loading" :row="5">
              <div v-if="inrHistoryList.length > 0" class="space-y-3">
                <div
                  v-for="item in inrHistoryList"
                  :key="item.id"
                  class="p-4 rounded-2xl bg-white shadow-sm"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="text-base text-gray-900 font-600">
                        IToken
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ t('buyHistory.labels.orderNo') }}: {{ item.taskNo }}
                      </div>
                      <div class="text-xs text-gray-400 mt-0.5">
                        {{ formatDate(item.createAt) }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg text-[#FF9933] tracking-tight font-700" style="font-variant-numeric: tabular-nums">
                        ₹{{ formatInr(item.taskAmt, 2) }}
                      </div>
                      <div
                        class="text-xs font-500 mt-1 px-2 py-0.5 rounded inline-block"
                        :class="[getStatusBg(item.payTaskStatus), getStatusColor(item.payTaskStatus)]"
                      >
                        {{ dictLabel('PayTaskStatus', item.payTaskStatus) }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <button class="text-sm text-[#FF9933] font-500 active:text-[#E68A2E]" @click="openDetail(item, 'inr')">
                      {{ t('buyHistory.labels.detail') }} →
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-1 items-center justify-center">
                <div class="mx-auto p-8 text-center rounded-2xl bg-white max-w-[360px] w-full shadow-sm">
                  <div class="mx-auto mb-4 rounded-full bg-[#FFF3E6] flex h-20 w-20 items-center justify-center">
                    <div class="i-carbon:shopping-cart text-4xl text-[#FF9933]" />
                  </div>
                  <p class="text-sm text-gray-600 mb-4">
                    {{ t('buyHistory.empty') }}
                  </p>
                  <button
                    class="text-sm text-white font-600 px-6 py-3 rounded-xl bg-[#FF9933] active:bg-[#E68A2E]"
                    @click="router.push('/buy')"
                  >
                    {{ t('buyHistory.toBuy') }}
                  </button>
                </div>
              </div>
            </van-skeleton>
          </div>

          <!-- 列表：INR 取消 -->
          <div v-else-if="activeTab === 'cancel'" class="flex flex-1 flex-col">
            <van-skeleton :loading="loading" :row="5">
              <div v-if="inrCancelList.length > 0" class="space-y-3">
                <div
                  v-for="item in inrCancelList"
                  :key="item.id"
                  class="p-4 rounded-2xl bg-white shadow-sm"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="text-base text-gray-900 font-600">
                        IToken
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ t('buyHistory.labels.orderNo') }}: {{ item.taskNo }}
                      </div>
                      <div class="text-xs text-gray-400 mt-0.5">
                        {{ formatDate(item.createAt) }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg text-gray-400 tracking-tight font-700" style="font-variant-numeric: tabular-nums">
                        ₹{{ formatInr(item.taskAmt, 2) }}
                      </div>
                      <div
                        class="text-xs font-500 mt-1 px-2 py-0.5 rounded inline-block"
                        :class="[getStatusBg(item.payTaskStatus), getStatusColor(item.payTaskStatus)]"
                      >
                        {{ dictLabel('PayTaskStatus', item.payTaskStatus) }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <button class="text-sm text-[#FF9933] font-500 active:text-[#E68A2E]" @click="openDetail(item, 'cancel')">
                      {{ t('buyHistory.labels.detail') }} →
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-1 items-center justify-center">
                <div class="mx-auto p-8 text-center rounded-2xl bg-white max-w-[360px] w-full shadow-sm">
                  <div class="mx-auto mb-4 rounded-full bg-[#FFF3E6] flex h-20 w-20 items-center justify-center">
                    <div class="i-carbon:document text-4xl text-[#FF9933]" />
                  </div>
                  <p class="text-sm text-gray-600 mb-4">
                    {{ t('buyHistory.empty') }}
                  </p>
                  <button
                    class="text-sm text-white font-600 px-6 py-3 rounded-xl bg-[#FF9933] active:bg-[#E68A2E]"
                    @click="router.push('/buy')"
                  >
                    {{ t('buyHistory.toBuy') }}
                  </button>
                </div>
              </div>
            </van-skeleton>
          </div>

          <!-- 列表：INR 锁定 -->
          <div v-else-if="activeTab === 'locked'" class="flex flex-1 flex-col">
            <van-skeleton :loading="loading" :row="5">
              <div v-if="inrLockList.length > 0" class="space-y-3">
                <div
                  v-for="item in inrLockList"
                  :key="item.id"
                  class="p-4 rounded-2xl bg-white shadow-sm"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="text-base text-gray-900 font-600">
                        IToken
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ t('buyHistory.labels.orderNo') }}: {{ item.taskNo }}
                      </div>
                      <div class="text-xs text-gray-400 mt-0.5">
                        {{ formatDate(item.createAt) }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg text-gray-400 tracking-tight font-700" style="font-variant-numeric: tabular-nums">
                        ₹{{ formatInr(item.taskAmt, 2) }}
                      </div>
                      <div
                        class="text-xs font-500 mt-1 px-2 py-0.5 rounded inline-block"
                        :class="[getStatusBg(item.payTaskStatus), getStatusColor(item.payTaskStatus)]"
                      >
                        {{ dictLabel('PayTaskStatus', item.payTaskStatus) }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <button class="text-sm text-[#FF9933] font-500 active:text-[#E68A2E]" @click="openDetail(item, 'inr')">
                      {{ t('buyHistory.labels.detail') }} →
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-1 items-center justify-center">
                <div class="mx-auto p-8 text-center rounded-2xl bg-white max-w-[360px] w-full shadow-sm">
                  <div class="mx-auto mb-4 rounded-full bg-[#FFF3E6] flex h-20 w-20 items-center justify-center">
                    <div class="i-carbon:locked text-4xl text-[#FF9933]" />
                  </div>
                  <p class="text-sm text-gray-600 mb-4">
                    {{ t('buyHistory.empty') }}
                  </p>
                  <button
                    class="text-sm text-white font-600 px-6 py-3 rounded-xl bg-[#FF9933] active:bg-[#E68A2E]"
                    @click="router.push('/buy')"
                  >
                    {{ t('buyHistory.toBuy') }}
                  </button>
                </div>
              </div>
            </van-skeleton>
          </div>

          <!-- 列表：USDT 历史 -->
          <div v-else class="flex flex-1 flex-col">
            <van-skeleton :loading="loading" :row="5">
              <div v-if="usdtHistoryList.length > 0" class="space-y-3">
                <div
                  v-for="record in usdtHistoryList"
                  :key="record.id"
                  class="p-4 rounded-2xl bg-white shadow-sm"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="text-base text-gray-900 font-600">
                        IToken
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ t('buyHistory.labels.quantity') }}: {{ record.quantity }}
                      </div>
                      <div class="text-xs text-gray-400 mt-0.5">
                        {{ formatDate(record.createAt) }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg text-[#138808] tracking-tight font-700" style="font-variant-numeric: tabular-nums">
                        {{ record.receiveTokenAmt }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <button class="text-sm text-[#FF9933] font-500 active:text-[#E68A2E]" @click="openDetail(record, 'usdt')">
                      {{ t('buyHistory.labels.detail') }} →
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-1 items-center justify-center">
                <div class="mx-auto p-8 text-center rounded-2xl bg-white max-w-[360px] w-full shadow-sm">
                  <div class="mx-auto mb-4 rounded-full bg-[#F0FDF0] flex h-20 w-20 items-center justify-center">
                    <div class="i-carbon:currency-rupee text-4xl text-[#138808]" />
                  </div>
                  <p class="text-sm text-gray-600">
                    {{ t('buyHistory.empty') }}
                  </p>
                </div>
              </div>
            </van-skeleton>
          </div>
        </div>
      </div>
    </van-pull-refresh>

    <!-- 分页固定在视窗底部 -->
    <div class="border-t border-gray-100 bg-white shadow-lg bottom-0 left-0 right-0 fixed z-20">
      <div class="mx-auto px-4 max-w-[480px]">
        <div class="py-3 flex gap-4 items-center justify-center">
          <button
            class="text-sm text-[#FF9933] font-500 px-5 py-2.5 border border-[#FFE4CC] rounded-xl bg-[#FFF9F5] active:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="page <= 1 || loading"
            @click="page--; loadCurrent()"
          >
            {{ t('buyHistory.pagination.prev') }}
          </button>
          <div class="text-sm text-gray-700 font-600 text-center min-w-[60px]">
            {{ page }} / {{ totalPage }}
          </div>
          <button
            class="text-sm text-[#FF9933] font-500 px-5 py-2.5 border border-[#FFE4CC] rounded-xl bg-[#FFF9F5] active:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="page >= totalPage || loading"
            @click="page++; loadCurrent()"
          >
            {{ t('buyHistory.pagination.next') }}
          </button>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showDetail" round position="bottom" :style="{ height: '70vh' }">
      <div class="mx-auto flex flex-col h-full max-w-[520px]">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div class="text-base text-gray-900 font-600">
            {{ detailType !== 'usdt' ? (detailData?.taskNo || '-') : (detailData?.txHash || '-') }}
          </div>
          <button class="text-xs text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50" @click="closeDetail">
            Close
          </button>
        </div>
        <div class="px-4 py-3 bg-white flex-1 overflow-auto">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Status
              </div>
              <div
                v-if="detailType !== 'usdt'"
                class="text-xs font-600"
                :class="getStatusColor(detailData?.payTaskStatus)"
              >
                {{ dictLabel('PayTaskStatus', detailData?.payTaskStatus) }}
              </div>
              <div v-else class="text-xs text-green-500 font-600">
                Success
              </div>
            </div>
            <div v-if="detailType !== 'usdt'" class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Amount
              </div>
              <div class="text-xs text-gray-900 font-600" style="font-variant-numeric: tabular-nums">
                ₹{{ formatInr(detailData?.taskAmt, 2) }}
              </div>
            </div>
            <div v-else class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Quantity
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.quantity }}
              </div>
            </div>
            <div v-if="detailType === 'usdt'" class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Receive IToken
              </div>
              <div class="text-xs text-green-600 font-600">
                {{ detailData?.receiveTokenAmt }}
              </div>
            </div>
            <div v-if="detailType !== 'usdt'" class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                UTR No
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.utrNo || 'NA' }}
              </div>
            </div>
            <div v-if="detailType !== 'usdt'" class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Withdraw Order No
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.withdrawOrderNo || '-' }}
              </div>
            </div>
            <div v-if="detailType !== 'usdt'" class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Withdraw Total Amt
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.withdrawTotalAmt ?? '-' }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Create time
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ formatDate(detailData?.createAt) }}
              </div>
            </div>
            <div v-if="detailType !== 'usdt'" class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Finish time
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ formatDate(detailData?.finishedAt) }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Username
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.username || '-' }}
              </div>
            </div>
            <div v-if="detailType !== 'usdt'" class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                UTR Source
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.utrSource || '-' }}
              </div>
            </div>
            <div v-if="detailType !== 'usdt'" class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                Reward Code
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.rewardCode || '-' }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="canOpenBankApp()" class="px-4 py-3 border-t border-gray-100 bg-white">
          <button
            class="text-sm text-white font-600 py-3 rounded-xl bg-[#FF9933] flex gap-2 w-full items-center justify-center active:bg-[#E68A2E]"
            @click="openBankApp"
          >
            <div class="i-carbon:launch text-lg" />
            Open Bank App
          </button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<route lang="json5">
{
  name: 'BuyHistory'
}
</route>
