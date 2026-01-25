<script setup lang="ts">
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import type { MbrPayInOrder } from '@/api/buy'
import { getSellHistory } from '@/api/buy'

const { t } = useI18n()

const activeTab = ref<'paying' | 'success' | 'all'>('paying')
const loading = ref(false)
const refreshing = ref(false)

// 分页
const page = ref(1)
const pageSize = ref(10)
const totalPage = ref(1)

// 列表数据
const sellList = ref<MbrPayInOrder[]>([])

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
  loading.value = true
  try {
    const payTaskStatus = activeTab.value === 'paying' ? '1' : activeTab.value === 'success' ? '3' : undefined
    const res = await getSellHistory({
      page: page.value,
      pageSize: pageSize.value,
      payTaskStatus,
    })
    if (res.code === '200') {
      sellList.value = res.data.list || []
      totalPage.value = res.data.totalPage || 1
    }
  }
  catch {
    showToast({ message: t('sellHistory.toast.loadFail'), type: 'fail' })
  }
  finally {
    loading.value = false
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

function formatDate(val: string) {
  if (!val)
    return '-'
  const d = new Date(val)
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatInr(val: any, digits = 2) {
  const num = Number(val)
  if (!Number.isFinite(num))
    return '0.00'
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(num)
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    0: t('sellHistory.status.pending'),
    1: t('sellHistory.status.paying'),
    2: t('sellHistory.status.paid'),
    3: t('sellHistory.status.success'),
    4: t('sellHistory.status.failed'),
    5: t('sellHistory.status.cancelled'),
  }
  return statusMap[status] || t('sellHistory.status.unknown')
}

function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    0: 'text-gray-600',
    1: 'text-orange-600',
    2: 'text-blue-600',
    3: 'text-green-600',
    4: 'text-red-600',
    5: 'text-gray-600',
  }
  return colorMap[status] || 'text-gray-600'
}

const showDetail = ref(false)
const detailData = ref<MbrPayInOrder | null>(null)

function openDetail(item: MbrPayInOrder) {
  detailData.value = item
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  detailData.value = null
}

function checkSellState() {
  router.push('/sell')
}
</script>

<template>
  <div class="bg-[#FFF9F5] min-h-screen pt-[46px]">
    <van-nav-bar
      title="Sell History"
      left-arrow
      fixed
      @click-left="router.back()"
    />
    <van-pull-refresh v-model="refreshing" class="min-h-screen" @refresh="onRefresh">
      <!-- 内容 -->
      <div class="mx-auto px-3 py-3 max-w-[480px]">
        <!-- 顶部标签 -->
        <div class="mb-3 p-1 rounded-2xl bg-white flex shadow-sm items-center">
          <button
            class="text-sm font-500 py-2.5 rounded-xl flex-1 transition-all"
            :class="[activeTab === 'paying' ? 'bg-[#FF9933] text-white shadow-sm' : 'text-gray-600']"
            @click="activeTab = 'paying'"
          >
            {{ t('sellHistory.tabs.paying') }}
          </button>
          <button
            class="text-sm font-500 py-2.5 rounded-xl flex-1 transition-all"
            :class="[activeTab === 'success' ? 'bg-[#FF9933] text-white shadow-sm' : 'text-gray-600']"
            @click="activeTab = 'success'"
          >
            {{ t('sellHistory.tabs.success') }}
          </button>
          <button
            class="text-sm font-500 py-2.5 rounded-xl flex-1 transition-all"
            :class="[activeTab === 'all' ? 'bg-[#FF9933] text-white shadow-sm' : 'text-gray-600']"
            @click="activeTab = 'all'"
          >
            {{ t('sellHistory.tabs.all') }}
          </button>
        </div>

        <!-- 主内容区 -->
        <div class="pb-20 flex flex-col" style="min-height: calc(100vh - 200px);">
          <div class="flex flex-1 flex-col">
            <van-skeleton :loading="loading" :row="5">
              <div v-if="sellList.length > 0" class="space-y-3">
                <div
                  v-for="item in sellList"
                  :key="item.id"
                  class="p-4 rounded-2xl bg-white shadow-sm"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="text-base text-gray-900 font-600">
                        IToken Sell
                      </div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ t('sellHistory.labels.orderNo') }}: {{ item.orderNo }}
                      </div>
                      <div class="text-xs text-gray-400 mt-0.5">
                        {{ formatDate(item.createAt) }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg text-[#FF9933] tracking-tight font-700" style="font-variant-numeric: tabular-nums">
                        ₹{{ formatInr(item.orderAmt, 2) }}
                      </div>
                      <div class="text-xs font-500 mt-1" :class="getStatusColor(item.payTaskStatus)">
                        {{ getStatusText(item.payTaskStatus) }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <button class="text-sm text-[#FF9933] font-500 active:text-[#E68A2E]" @click="openDetail(item)">
                      {{ t('sellHistory.labels.detail') }} →
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-1 items-center justify-center">
                <div class="mx-auto p-8 text-center rounded-2xl bg-white max-w-[360px] w-full shadow-sm">
                  <div class="mx-auto mb-4 rounded-full bg-[#FFF3E6] flex h-20 w-20 items-center justify-center">
                    <div class="i-carbon:document text-4xl text-[#FF9933]" />
                  </div>
                  <p class="text-sm text-gray-600 leading-relaxed mb-4">
                    {{ t('sellHistory.empty') }}
                  </p>
                  <button
                    class="text-sm text-white font-600 px-6 py-3 rounded-xl bg-[#FF9933] active:bg-[#E68A2E]"
                    @click="checkSellState"
                  >
                    {{ t('sellHistory.checkSellState') }}
                  </button>
                </div>
              </div>
            </van-skeleton>
          </div>
        </div>
      </div>
    </van-pull-refresh>

    <!-- 分页固定在视窗底部 -->
    <div class="border-t border-gray-100 bg-white shadow-lg bottom-0 left-0 right-0 fixed z-20" style="bottom: 50px;">
      <div class="mx-auto px-4 max-w-[480px]">
        <div class="py-3 flex gap-4 items-center justify-center">
          <button
            class="text-sm text-[#FF9933] font-500 px-5 py-2.5 border border-[#FFE4CC] rounded-xl bg-[#FFF9F5] active:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="page <= 1 || loading"
            @click="page--; loadCurrent()"
          >
            {{ t('sellHistory.pagination.prev') }}
          </button>
          <div class="text-sm text-gray-700 font-600 text-center min-w-[60px]">
            {{ page }} / {{ totalPage }}
          </div>
          <button
            class="text-sm text-[#FF9933] font-500 px-5 py-2.5 border border-[#FFE4CC] rounded-xl bg-[#FFF9F5] active:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="page >= totalPage || loading"
            @click="page++; loadCurrent()"
          >
            {{ t('sellHistory.pagination.next') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <van-popup v-model:show="showDetail" round position="bottom" :style="{ height: '70vh' }">
      <div class="mx-auto flex flex-col h-full max-w-[520px]">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div class="text-base text-gray-900 font-600">
            {{ detailData?.orderNo || '-' }}
          </div>
          <button class="text-xs text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50" @click="closeDetail">
            {{ t('sellHistory.labels.close') }}
          </button>
        </div>
        <div class="px-4 py-3 bg-white flex-1 overflow-auto">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ t('sellHistory.labels.status') }}
              </div>
              <div class="text-xs font-600" :class="getStatusColor(detailData?.payTaskStatus || '')">
                {{ getStatusText(detailData?.payTaskStatus || '') }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ t('sellHistory.labels.amount') }}
              </div>
              <div class="text-xs text-gray-900 font-600" style="font-variant-numeric: tabular-nums">
                ₹{{ formatInr(detailData?.orderAmt, 2) }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ t('sellHistory.labels.upiNo') }}
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.upiNo || '-' }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ t('sellHistory.labels.realName') }}
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.realName || '-' }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ t('sellHistory.labels.utrNo') }}
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.utrNo || '-' }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ t('sellHistory.labels.clientOrderNo') }}
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.cliOrderNo || '-' }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ t('sellHistory.labels.createTime') }}
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ formatDate(detailData?.createAt || '') }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ t('sellHistory.labels.finishTime') }}
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ formatDate(detailData?.finishedAt || '') }}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ t('sellHistory.labels.username') }}
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData?.username || '-' }}
              </div>
            </div>
            <div v-if="detailData?.memo" class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ t('sellHistory.labels.memo') }}
              </div>
              <div class="text-xs text-gray-900 font-600">
                {{ detailData.memo }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<route lang="json5">
{
  name: 'SellHistory'
}
</route>
