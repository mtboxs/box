<!-- eslint-disable -->
<script setup lang="ts">
import { getHomeInfo } from '@/api/home'
import type { MchPicResources, MchRichText } from '@/api/home'
import type { NewbieRewardInfo } from '@/api/mine'
import { getNewbieReward } from '@/api/mine'
import dayjs from 'dayjs'
import usdtIcon from '@/assets/images/usdt.png'
import siteLogo from '@/assets/images/logo.svg'

const picResources = ref<MchPicResources[]>([])
const configs = ref<any[]>([])
const richTexts = ref<MchRichText[]>([])
const loading = ref(false)
const usdtPrice = computed(() => configValue('usdt_buy_price', '94'))
const reward = computed(() => configValue('reward_ratio', '2%'))
const todayProfit = computed(() => configValue('today_profit', '0'))
const router = useRouter()

// 公告弹窗
const showNoticeDialog = ref(false)
const noticeIndex = ref(0)

// 新手任务
const newbieReward = ref<NewbieRewardInfo | null>(null)

// 轮播图 (resourceType: 0)
const banners = computed(() =>
  picResources.value.filter(it => String(it.resourceType) === '0').sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0)),
)

// 公告 (resourceType: 1, 2)
const notices = computed(() =>
  picResources.value.filter(it => ['1', '2'].includes(String(it.resourceType))).sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0)),
)

// 跑马灯文字
const marqueeText = computed(() =>
  notices.value.map(n => n.remark || n.name || '').filter(Boolean).join('  ·  '),
)

// 新闻列表 (richTexts resourceType: 3)
const newsList = computed(() =>
  richTexts.value.filter(it => String(it.resourceType) === '3').sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0)),
)

const topNews = computed(() => newsList.value[0] || null)

onMounted(async () => {
  await nextTick()

  try {
    loading.value = true

    // 优先从缓存读取配置
    const cachedConfigs = localStorage.getItem('app_configs')
    if (cachedConfigs) {
      try {
        configs.value = JSON.parse(cachedConfigs)
      }
      catch (e) {
        console.error('Failed to parse cached configs', e)
      }
    }

    const results = await Promise.allSettled([
      getHomeInfo(),
      getNewbieReward(),
    ])

    const [homeRes, newbieRes] = results

    if (homeRes.status === 'fulfilled' && homeRes.value.code === '200') {
      configs.value = homeRes.value.data?.configs || []
      richTexts.value = homeRes.value.data?.richTexts || []
      picResources.value = homeRes.value.data?.picResources || []

      // 更新缓存
      localStorage.setItem('app_configs', JSON.stringify(configs.value))
    }

    if (newbieRes.status === 'fulfilled' && newbieRes.value.code === '200') {
      // eslint-disable-next-line no-console
      console.log('Newbie Reward Data:', newbieRes.value.data)
      newbieReward.value = newbieRes.value.data
    }

    // 有公告就弹窗
    if (notices.value.length > 0) {
      noticeIndex.value = 0
      showNoticeDialog.value = true
    }
  }
  finally {
    loading.value = false
  }
})

function openNotice() {
  if (notices.value.length > 0) {
    noticeIndex.value = 0
    showNoticeDialog.value = true
  }
}

function configValue(key: string, fallback = '') {
  const found = configs.value.find((c: any) => c.paramKey === key)
  return found?.paramValue ?? fallback
}

function formatDate(timestamp: string | number | undefined) {
  if (!timestamp)
    return '-'
  return dayjs(Number(timestamp)).format('YYYY-MM-DD HH:mm:ss')
}

function goBuy() {
  router.push('/buy')
}

function goUsdtRecharge() {
  // eslint-disable-next-line no-console
  console.log('Navigating to BuyUsdt')
  router.push({ name: 'BuyUsdt' })
}

function goSellHistory() {
  router.push('/sell/history')
}

function onBannerClick() {
  router.push('/buy')
}

function onAutoSelling() {
  router.push('/buy')
}

function onSellFaster() {
  router.push('/buy')
}

function onSellSet() {
  router.push('/buy')
}

function onLinkUpi() {
  router.push('/upi')
}

function goNewsList() {
  router.push('/news')
}

function goNewsDetail() {
  if (topNews.value?.id)
    router.push(`/news/${topNews.value.id}`)
}

function goNewbieRewards() {
  router.push('/rewards/newbie')
}
</script>

<template>
  <div class="bg-[#FFF9F5] min-h-screen">
    <!-- 公告弹窗 (支持多个轮播) -->
    <van-popup v-model:show="showNoticeDialog" round :close-on-click-overlay="true" class="notice-popup">
      <div class="max-w-[340px] w-[85vw] relative">
        <!-- 关闭按钮 -->
        <button
          class="rounded-full bg-black/10 flex h-8 w-8 items-center right-2 top-2 justify-center absolute z-10 active:bg-black/20"
          @click="showNoticeDialog = false"
        >
          <div class="i-carbon:close text-lg text-gray-600" />
        </button>
        <!-- 单个公告 -->
        <div v-if="notices.length === 1" class="p-4 pt-10">
          <div class="mb-3 text-center">
            <div class="text-base text-gray-800 font-600">
              {{ notices[0]?.name || 'Notice' }}
            </div>
          </div>
          <img v-if="notices[0]?.srcUrl" :src="notices[0].srcUrl" class="mb-3 rounded-lg w-full" alt="">
          <div class="text-sm text-gray-600 leading-relaxed max-h-[40vh] overflow-y-auto">
            {{ notices[0]?.remark || '' }}
          </div>
        </div>
        <!-- 多个公告轮播 -->
        <div v-else-if="notices.length > 1" class="notice-swipe-wrap pt-10">
          <van-swipe
            :autoplay="5000"
            :show-indicators="false"
            :touchable="true"
            :stop-propagation="true"
            class="notice-swipe"
            @change="noticeIndex = $event"
          >
            <van-swipe-item v-for="n in notices" :key="n.id">
              <div class="notice-slide-content">
                <div class="mb-3 text-center">
                  <div class="text-base text-gray-800 font-600">
                    {{ n.name || 'Notice' }}
                  </div>
                </div>
                <img v-if="n.srcUrl" :src="n.srcUrl" class="mb-3 rounded-lg w-full" alt="">
                <div class="notice-text-scroll">
                  {{ n.remark || '' }}
                </div>
              </div>
            </van-swipe-item>
          </van-swipe>
          <!-- 自定义 dots -->
          <div class="notice-dots">
            <span
              v-for="(_, idx) in notices"
              :key="idx"
              class="notice-dot"
              :class="{ active: idx === noticeIndex }"
            />
          </div>
        </div>
      </div>
    </van-popup>

    <div class="mx-auto px-4 pb-5 pt-3 max-w-[480px]">
      <van-skeleton :loading="loading" :row="6">
        <!-- 轮播图区域 - 黄金比例 16:10 -->
        <div class="banner-section mb-3">
          <van-swipe
            v-if="banners.length"
            :autoplay="4000"
            indicator-color="#FF9933"
            class="banner-swipe"
          >
            <van-swipe-item v-for="b in banners" :key="b.id" @click="onBannerClick">
              <div class="banner-item">
                <van-image :src="b.srcUrl" fit="cover" class="h-full w-full" />
              </div>
            </van-swipe-item>
          </van-swipe>
          <div v-else class="banner-placeholder">
            <div class="i-carbon:image text-4xl text-gray-300" />
          </div>
        </div>

        <!-- 跑马灯公告 - 紧凑型 -->
        <div
          v-if="marqueeText"
          class="marquee-bar mb-3"
          @click="openNotice"
        >
          <div class="marquee-icon">
            <div class="i-carbon:notification text-[#FF9933]" />
          </div>
          <div class="marquee-content">
            <van-notice-bar
              :text="marqueeText"
              :scrollable="true"
              background="transparent"
              color="#666"
              :speed="50"
            />
          </div>
          <div class="i-carbon:chevron-right text-sm text-gray-400" />
        </div>

        <!-- 业务区 - 主要区域 (61.8%) -->
        <div class="business-card mb-3">
          <!-- 余额头部 -->
          <div class="balance-header">
            <div class="header-left">
              <div class="header-title">
                My IToken
              </div>
              <div class="header-rate">
                1 Rs = 1 IToken · 1 USDT ≈ {{ usdtPrice }} IToken
              </div>
            </div>
          </div>

          <!-- 余额与购买 -->
          <div class="balance-row">
            <div class="balance-wrap">
              <div class="flag-icon">
                <img src="@/assets/images/in.png" alt="IN" class="w-7 h-5 object-cover rounded shadow-sm">
              </div>
              <div class="balance-amount flex items-center gap-2">
                <div class="flex items-center">
                  <div class="i-carbon:currency-rupee text-2xl" />
                  {{ usdtPrice }}
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="primary-buy-btn" @click="goBuy">
                <div class="i-carbon:currency-rupee" />
                <span>Buy</span>
              </button>
            </div>
          </div>

          <!-- USDT Entry -->
          <div class="mb-4 p-3 rounded-xl bg-[#F0FDF0] flex cursor-pointer transition-opacity items-center justify-between active:opacity-80" @click="goUsdtRecharge">
            <div class="flex gap-3 items-center">
              <div class="rounded-full flex h-10 w-10 items-center justify-center overflow-hidden">
                <img :src="usdtIcon" class="h-full w-full object-cover" alt="USDT">
              </div>
              <div class="flex flex-col">
                <span class="text-sm text-[#2e9e2e] font-600">USDT Recharge</span>
                <span class="text-xs text-gray-500">Fast & Secure</span>
              </div>
            </div>
            <div class="i-carbon:chevron-right text-[#2e9e2e]" />
          </div>

          <!-- Team Entry -->
          <div class="mb-4 p-3 rounded-xl bg-[#EBF5FF] flex cursor-pointer transition-opacity items-center justify-between active:opacity-80" @click="router.push('/team')">
            <div class="flex gap-3 items-center">
              <div class="rounded-full bg-white flex h-10 w-10 items-center justify-center shadow-sm">
                <div class="i-carbon:group text-2xl text-[#3B82F6]" />
              </div>
              <div class="flex flex-col">
                <span class="text-sm text-[#3B82F6] font-600">My Team</span>
                <span class="text-xs text-[#60A5FA]">Manage your team & rewards</span>
              </div>
            </div>
            <div class="i-carbon:chevron-right text-[#3B82F6]" />
          </div>

          <!-- 新手任务入口 -->
          <div
            class="mb-4 p-3 rounded-xl flex cursor-pointer transition-opacity items-center justify-between from-[#FFF3E0] to-[#FFE0B2] bg-gradient-to-r active:opacity-90"
            @click="goNewbieRewards"
          >
            <div class="flex gap-3 items-center">
              <div class="p-1 rounded-full bg-white flex h-10 w-10 shadow-sm items-center justify-center overflow-hidden">
                <img :src="siteLogo" class="h-full w-full object-contain" alt="Gift">
              </div>
              <div class="flex flex-col">
                <span class="text-sm text-[#E65100] font-700">Newbie 7-Day Challenge</span>
                <span class="text-xs text-[#F57C00]">Win up to ₹{{ newbieReward?.totalBonus || '1000' }}</span>
              </div>
            </div>
            <div class="flex gap-2 items-center">
              <div class="i-carbon:chevron-right text-[#E65100]" />
            </div>
          </div>

          <div class="section-divider" />

          <!-- 统计数据 -->
          <div class="stats-section">
            <div class="stats-left">
              <div class="stat-col">
                <div class="stat-label">
                  Today Profit
                </div>
                <div class="stat-val">
                  {{ todayProfit }}
                </div>
              </div>
              <div class="stat-col">
                <div class="stat-label">
                  Reward
                </div>
                <div class="stat-val">
                  {{ reward }}
                </div>
              </div>
            </div>
            <button class="outline-btn" @click="router.push('/buy/history')">
              Buy History
            </button>
          </div>

          <div class="section-divider" />

          <!-- 快捷操作与出售记录 -->
          <div class="actions-section">
            <div class="action-grid">
              <div class="grid-item text-primary" @click="onAutoSelling">
                Auto Selling
              </div>
              <div class="grid-item text-primary" @click="onSellFaster">
                Sell Faster
              </div>
              <div class="grid-item text-secondary" @click="onSellSet">
                Sell Set
              </div>
              <div class="grid-item text-secondary" @click="onLinkUpi">
                Link Upi
              </div>
            </div>
            <button class="outline-btn self-end" @click="goSellHistory">
              Sell History
            </button>
          </div>
        </div>

        <!-- 新闻区域 - 次要区域 (38.2%) -->
        <div class="news-card">
          <div class="news-header">
            <div class="news-title">
              <div class="i-carbon:blog text-[#FF9933] mr-2" />
              Latest News
            </div>
            <button class="news-more" @click="goNewsList">
              View All
              <div class="i-carbon:chevron-right text-xs" />
            </button>
          </div>
          <div v-if="topNews" class="news-item" @click="goNewsDetail">
            <div class="news-cover">
              <img v-if="topNews.coverImg" :src="topNews.coverImg" alt="">
              <div v-else class="news-cover-placeholder">
                <div class="i-carbon:document text-xl text-[#FF9933]" />
              </div>
            </div>
            <div class="news-info">
              <div class="news-name">
                {{ topNews.name || '-' }}
              </div>
              <div class="news-date">
                {{ formatDate(topNews.updateAt) }}
              </div>
            </div>
            <div class="i-carbon:chevron-right text-gray-300" />
          </div>
          <div v-else class="news-empty">
            No news available
          </div>
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'Home'
}
</route>

<style scoped>
/* 公告弹窗样式 */
.notice-popup {
  overflow: visible;
}

.notice-swipe-wrap {
  position: relative;
  padding-bottom: 24px;
}

.notice-swipe {
  height: auto;
}

.notice-swipe :deep(.van-swipe__track) {
  display: flex;
  align-items: stretch;
}

.notice-swipe :deep(.van-swipe-item) {
  height: auto;
  flex-shrink: 0;
}

.notice-slide-content {
  padding: 16px;
  padding-bottom: 8px;
  touch-action: pan-y;
}

.notice-text-scroll {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  max-height: 35vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.notice-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
}

.notice-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #d1d5db;
  transition: all 0.3s ease;
}

.notice-dot.active {
  width: 16px;
  border-radius: 3px;
  background-color: #ff9933;
}

/* ===== 轮播图区域 - 黄金比例 ===== */
.banner-section {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.banner-swipe {
  width: 100%;
}

.banner-item {
  width: 100%;
  /* 黄金比例 16:10 (1.6) */
  aspect-ratio: 16 / 10;
}

.banner-placeholder {
  aspect-ratio: 16 / 10;
  background: linear-gradient(135deg, #fff9f5 0%, #ffe4cc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== 跑马灯公告 ===== */
.marquee-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.marquee-icon {
  width: 28px;
  height: 28px;
  background: #fff3e6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.marquee-content {
  flex: 1;
  overflow: hidden;
}

.marquee-content :deep(.van-notice-bar) {
  padding: 0;
  height: 24px;
  line-height: 24px;
}

/* ===== 业务卡片 - 主区域 ===== */
.business-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.balance-header {
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #374151;
}

.header-rate {
  font-size: 11px;
  color: #9ca3af;
}

.balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.balance-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.flag-icon {
  font-size: 28px;
  line-height: 1;
}

.balance-amount {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  font-variant-numeric: tabular-nums;
  letter-spacing: -1px;
}

.primary-buy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #1976d2;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  transition: opacity 0.2s;
}

.primary-buy-btn:active {
  opacity: 0.9;
}

.section-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 16px 0;
}

.stats-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stats-left {
  display: flex;
  gap: 40px;
}

.stat-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-val {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.outline-btn {
  padding: 6px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #4b5563;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.15s;
}

.outline-btn:active {
  background: #f9fafb;
}

.actions-section {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.action-grid {
  display: grid;
  grid-template-columns: auto auto;
  gap: 12px 24px;
}

.grid-item {
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.text-primary {
  color: #374151;
}

.text-secondary {
  color: #9ca3af;
  font-size: 12px;
}

.self-end {
  align-self: flex-end;
}

/* ===== 新闻卡片 - 次区域 ===== */
.news-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.news-title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.news-more {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
  color: #ff9933;
  background: none;
  border: none;
}

.news-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.news-item:active {
  background: #fff9f5;
}

.news-cover {
  width: 80px;
  height: 54px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  /* 黄金比例近似 3:2 */
}

.news-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-cover-placeholder {
  width: 100%;
  height: 100%;
  background: #fff3e6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.news-info {
  flex: 1;
  min-width: 0;
}

.news-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-date {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 6px;
}

.news-empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}
</style>
