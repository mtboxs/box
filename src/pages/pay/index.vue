<script setup lang="ts">
import { showToast } from 'vant'
import { getPayInfo } from '@/api/recharge'
import type { RechargePayResponse } from '@/api/recharge'

const route = useRoute()
const { t } = useI18n()

const loading = ref(true)
const matching = ref(true)
const payInfo = ref<RechargePayResponse | null>(null)
const error = ref('')
const countdown = ref(0)
const expired = ref(false)
const failed = ref(false)
const success = ref(false)

const orderNo = computed(() => {
  const q = route.query as any
  return q.no || q.orderNo || q.order_no || ''
})

let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

async function fetchPayInfo() {
  if (!orderNo.value) {
    error.value = 'Missing order number'
    loading.value = false
    matching.value = false
    return
  }

  try {
    const res = await getPayInfo({ no: orderNo.value })
    console.log('[pay.do response]', res.data)

    if (res.code === '200' && res.data) {
      payInfo.value = res.data
      loading.value = false

      const leftTime = res.data.leftTime || 0
      const stat = res.data.stat

      // 1. 超时判断
      if (leftTime <= 0) {
        expired.value = true
        matching.value = false
        stopPolling()
        stopCountdown()
        return
      }

      // 更新倒计时
      countdown.value = leftTime
      if (!countdownTimer) {
        startCountdown()
      }

      // 2. 根据 stat 判断状态
      if (stat === 'init') {
        // init: 还在匹配中，继续轮询，倒计时继续
        matching.value = true
      }
      else if (stat === 'pending') {
        // pending: 已匹配到卡，停止轮询，显示支付信息，倒计时继续
        matching.value = false
        stopPolling()
      }
      else if (stat === 'success') {
        // success: 隐藏银行卡，倒计时继续
        matching.value = false
        success.value = true
        stopPolling()
      }
      else if (stat === 'failed') {
        // failed: 隐藏银行卡，倒计时继续
        matching.value = false
        failed.value = true
        stopPolling()
      }
      else {
        // 其他状态: 继续轮询重新匹配，倒计时继续
        matching.value = true
      }
    }
    else {
      error.value = (res.msg ? t(res.msg) : '') || 'Failed to get payment info'
      loading.value = false
      matching.value = false
      stopPolling()
    }
  }
  catch (e) {
    console.error('Fetch pay info error:', e)
  }
}

function startPolling() {
  if (pollTimer)
    return
  pollTimer = setInterval(() => {
    fetchPayInfo()
  }, 3000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function startCountdown() {
  if (countdownTimer)
    return
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
      if (countdown.value <= 0) {
        expired.value = true
        stopCountdown()
      }
    }
    else {
      expired.value = true
      stopCountdown()
    }
  }, 1000)
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  showToast({ message: 'Copied!', icon: 'success' })
}

onMounted(() => {
  fetchPayInfo()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
  stopCountdown()
})
</script>

<template>
  <div class="pay-page">
    <!-- 匹配中 -->
    <div v-if="matching && !error" class="page-content">
      <div class="header">
        <div class="header-top">
          <span class="upi-badge">UPI</span>
        </div>
        <div class="timer">
          {{ formatCountdown(countdown) }}
        </div>
        <div class="timer-label">
          Time Remaining
        </div>
      </div>

      <div class="center-content">
        <div class="spinner" />
        <p class="status-text">
          Finding payment channel...
        </p>
        <p v-if="payInfo?.orderNo" class="order-id">
          {{ payInfo.orderNo }}
        </p>
      </div>
    </div>

    <!-- 已超时 -->
    <div v-else-if="expired && !error" class="page-content">
      <div class="header header-expired">
        <div class="header-top">
          <span class="upi-badge">UPI</span>
        </div>
        <div class="timer">
          00:00
        </div>
        <div class="timer-label">
          Expired
        </div>
      </div>

      <div class="center-content">
        <div class="expired-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </div>
        <p class="status-text">
          Order Expired
        </p>
        <p class="status-desc">
          Please do not transfer to this account
        </p>
        <p v-if="payInfo?.orderNo" class="order-id">
          {{ payInfo.orderNo }}
        </p>
      </div>
    </div>

    <!-- 成功 -->
    <div v-else-if="success && !error" class="page-content">
      <div class="header header-success">
        <div class="header-top">
          <span class="upi-badge">UPI</span>
        </div>
        <div class="timer">
          {{ formatCountdown(countdown) }}
        </div>
        <div class="timer-label">
          Time Remaining
        </div>
      </div>

      <div class="center-content">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="8,12 11,15 16,9" />
          </svg>
        </div>
        <p class="status-text">
          Payment Successful
        </p>
        <p v-if="payInfo?.orderNo" class="order-id">
          {{ payInfo.orderNo }}
        </p>
      </div>
    </div>

    <!-- 失败 -->
    <div v-else-if="failed && !error" class="page-content">
      <div class="header header-failed">
        <div class="header-top">
          <span class="upi-badge">UPI</span>
        </div>
        <div class="timer">
          {{ formatCountdown(countdown) }}
        </div>
        <div class="timer-label">
          Time Remaining
        </div>
      </div>

      <div class="center-content">
        <div class="failed-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p class="status-text">
          Payment Failed
        </p>
        <p v-if="payInfo?.orderNo" class="order-id">
          {{ payInfo.orderNo }}
        </p>
      </div>
    </div>

    <!-- 支付信息 -->
    <div v-else-if="payInfo && !error" class="page-content">
      <div class="header">
        <div class="header-top">
          <span class="upi-badge">UPI</span>
        </div>
        <div class="timer">
          {{ formatCountdown(countdown) }}
        </div>
        <div class="timer-label">
          Time Remaining
        </div>
      </div>

      <div class="pay-body">
        <!-- 金额 -->
        <div class="amount-card">
          <div class="amount">
            <span class="rupee">₹</span>{{ payInfo.amount }}
          </div>
          <div class="amount-hint">
            Transfer exact amount
          </div>
        </div>

        <!-- 支付详情 -->
        <div class="detail-card">
          <div class="detail-row" @click="copyText(payInfo.payAccount)">
            <div class="detail-info">
              <span class="detail-label">UPI ID</span>
              <span class="detail-value">{{ payInfo.payAccount || '-' }}</span>
            </div>
            <button v-if="payInfo.payAccount" class="copy-btn">
              COPY
            </button>
          </div>

          <div class="divider" />

          <div class="detail-row" @click="copyText(payInfo.realName)">
            <div class="detail-info">
              <span class="detail-label">Account Name</span>
              <span class="detail-value">{{ payInfo.realName || '-' }}</span>
            </div>
            <button v-if="payInfo.realName" class="copy-btn">
              COPY
            </button>
          </div>

          <div class="divider" />

          <div class="detail-row" @click="copyText(payInfo.amount)">
            <div class="detail-info">
              <span class="detail-label">Amount</span>
              <span class="detail-value highlight">₹{{ payInfo.amount }}</span>
            </div>
            <button class="copy-btn">
              COPY
            </button>
          </div>
        </div>

        <!-- 提示 -->
        <div class="notice">
          <svg class="notice-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <span>Pay the exact amount to ensure successful credit</span>
        </div>
      </div>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="page-content">
      <div class="header header-error">
        <div class="header-top">
          <span class="upi-badge">UPI</span>
        </div>
      </div>

      <div class="center-content">
        <div class="error-icon">
          !
        </div>
        <p class="status-text">
          Something went wrong
        </p>
        <p class="status-desc">
          {{ error }}
        </p>
        <button class="retry-btn" @click="fetchPayInfo">
          Try Again
        </button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else class="page-content">
      <div class="header">
        <div class="header-top">
          <span class="upi-badge">UPI</span>
        </div>
      </div>

      <div class="center-content">
        <div class="spinner" />
        <p class="status-text">
          Loading...
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pay-page {
  min-height: 100vh;
  background: #fff9f5;
}

.page-content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header - 印度橙色 */
.header {
  background: linear-gradient(135deg, #ff9933 0%, #ff7700 100%);
  padding: 20px 20px 32px;
  text-align: center;
  border-radius: 0 0 24px 24px;
}

.header-expired {
  background: linear-gradient(135deg, #8b8b8b 0%, #6b6b6b 100%);
}

.header-success {
  background: linear-gradient(135deg, #2e9e2e 0%, #228b22 100%);
}

.header-failed {
  background: linear-gradient(135deg, #e85d5d 0%, #d64545 100%);
}

.header-error {
  background: linear-gradient(135deg, #e85d5d 0%, #d64545 100%);
  padding-bottom: 20px;
}

.header-top {
  margin-bottom: 16px;
}

.upi-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 1px;
}

.timer {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timer-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4px;
}

/* 居中内容 */
.center-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #ffe5cc;
  border-top-color: #ff9933;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.status-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px;
  text-align: center;
}

.order-id {
  font-size: 12px;
  color: #999;
  margin: 16px 0 0;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 20px;
}

/* 超时图标 */
.expired-icon {
  width: 64px;
  height: 64px;
  color: #999;
  margin-bottom: 20px;
}

.expired-icon svg {
  width: 100%;
  height: 100%;
}

/* 失败图标 */
.failed-icon {
  width: 64px;
  height: 64px;
  color: #e85d5d;
  margin-bottom: 20px;
}

.failed-icon svg {
  width: 100%;
  height: 100%;
}

/* 成功图标 */
.success-icon {
  width: 64px;
  height: 64px;
  color: #2e9e2e;
  margin-bottom: 20px;
}

.success-icon svg {
  width: 100%;
  height: 100%;
}

/* 错误图标 */
.error-icon {
  width: 56px;
  height: 56px;
  background: #ffebeb;
  color: #e85d5d;
  font-size: 28px;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.retry-btn {
  margin-top: 8px;
  padding: 12px 32px;
  background: #ff9933;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 25px;
  cursor: pointer;
}

.retry-btn:active {
  background: #ff7700;
}

/* 支付主体 */
.pay-body {
  flex: 1;
  padding: 20px 16px;
  margin-top: -16px;
}

/* 金额卡片 */
.amount-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(255, 153, 51, 0.1);
  border: 1px solid #ffe5cc;
}

.amount {
  font-size: 42px;
  font-weight: 700;
  color: #ff7700;
  font-variant-numeric: tabular-nums;
}

.rupee {
  font-size: 28px;
  margin-right: 2px;
}

.amount-hint {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

/* 详情卡片 */
.detail-card {
  background: #fff;
  border-radius: 16px;
  margin-top: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.detail-row:active {
  background: #fffaf5;
}

.detail-info {
  flex: 1;
  min-width: 0;
}

.detail-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.detail-value {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  word-break: break-all;
}

.detail-value.highlight {
  color: #ff7700;
  font-weight: 600;
}

.copy-btn {
  background: #fff5eb;
  color: #ff9933;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  margin-left: 12px;
  cursor: pointer;
  letter-spacing: 0.5px;
}

.copy-btn:active {
  background: #ffead6;
}

.divider {
  height: 1px;
  background: #f5f5f5;
  margin: 0 16px;
}

/* 提示 */
.notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 16px;
  padding: 14px 16px;
  background: #f0faf0;
  border-radius: 12px;
  border: 1px solid #d4eed4;
}

.notice-icon {
  width: 18px;
  height: 18px;
  color: #2e9e2e;
  flex-shrink: 0;
  margin-top: 1px;
}

.notice span {
  font-size: 13px;
  color: #2e7d2e;
  line-height: 1.5;
}
</style>

<route lang="json5">
{
  name: 'Pay',
  meta: {
    title: 'Payment',
    hideNavbar: true,
    hideTabbar: true
  }
}
</route>
