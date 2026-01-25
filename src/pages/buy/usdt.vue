<script setup lang="ts">
import { showToast } from 'vant'
import QRCode from 'qrcode'
import { useI18n } from 'vue-i18n'
import { formatTime } from '@/utils/date'
import type { MbrUsdtBuyRecord } from '@/api/buy'
import { getUsdtHistory } from '@/api/buy'

const { t } = useI18n()

// USDT 相关
const exchangeRate = ref(94) // 1 USDT = 94 IToken
const usdtAmount = ref<number | string>('')
const walletAddress = ref('')
const networkType = ref('Tron(TRC20)')
const qrCodeUrl = ref('')
const showUsdtPreview = ref(true)
const usdtPreviewList = ref<MbrUsdtBuyRecord[]>([])
const usdtPreviewLoading = ref(false)
const refreshing = ref(false)

onMounted(async () => {
  // 使用 nextTick 延迟数据加载，让页面先渲染
  await nextTick()

  // 从 localStorage 读取 user_info
  const storedUserInfo = localStorage.getItem('user_info')
  if (storedUserInfo) {
    try {
      const userInfo = JSON.parse(storedUserInfo)
      walletAddress.value = userInfo?.trc20Address || userInfo?.address || userInfo?.walletAddress || ''

      // 生成二维码
      if (walletAddress.value) {
        qrCodeUrl.value = await QRCode.toDataURL(walletAddress.value, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
      }
    }
    catch (error) {
      console.error('Failed to load user info:', error)
    }
  }

  await loadUsdtPreview()
})

function copyAddress() {
  navigator.clipboard.writeText(walletAddress.value)
  showToast({ message: 'Address copied', type: 'success' })
}

function saveImage() {
  showToast({ message: 'Image saved', type: 'success' })
}

function calculateToken() {
  if (usdtAmount.value) {
    return (Number(usdtAmount.value) * exchangeRate.value).toFixed(2)
  }
  return '0'
}

function formatDate(timestamp: string) {
  return formatTime(timestamp)
}

async function loadUsdtPreview() {
  usdtPreviewLoading.value = true
  try {
    const res = await getUsdtHistory({ page: 1, pageSize: 2 })
    if (res.code === '200') {
      usdtPreviewList.value = res.data.list || []
    }
  }
  catch {
    showToast({ message: 'Failed to load history', type: 'fail' })
  }
  finally {
    usdtPreviewLoading.value = false
  }
}

async function onRefresh() {
  try {
    await loadUsdtPreview()
  }
  finally {
    refreshing.value = false
  }
}
</script>

<template>
  <div class="buy-page">
    <van-pull-refresh v-model="refreshing" class="pull-refresh-wrap" @refresh="onRefresh">
      <!-- USDT 内容 -->
      <div class="usdt-content">
        <!-- 汇率显示 -->
        <div class="rate-card">
          1 USDT ≈ <span class="rate-value">{{ exchangeRate }}</span> IToken
        </div>

        <!-- 输入数量 -->
        <div class="detail-card">
          <div class="usdt-input-row">
            <input
              v-model="usdtAmount"
              type="number"
              :placeholder="t('buy.usdt.enterQuantityPlaceholder')"
              class="usdt-input"
            >
          </div>
          <div class="token-result">
            <span class="result-label">{{ t('buy.usdt.receiveToken') }}</span>
            <span class="result-value">{{ calculateToken() }} IToken</span>
          </div>
        </div>

        <!-- 二维码 -->
        <div class="qr-card">
          <div v-if="qrCodeUrl" class="qr-wrap">
            <img :src="qrCodeUrl" alt="QR Code" class="qr-img">
          </div>
          <div v-else class="qr-placeholder">
            {{ t('buy.usdt.loadingQr') }}
          </div>
          <div class="qr-tip">
            {{ t('buy.usdt.sendOnlyTip') }}
          </div>
        </div>

        <!-- 钱包地址 -->
        <div class="detail-card">
          <span class="field-label">{{ t('buy.usdt.walletAddress') }}</span>
          <div class="address-row">
            <span class="address-text">{{ walletAddress }}</span>
            <button class="copy-btn" @click="copyAddress">
              COPY
            </button>
          </div>
          <div class="network-row">
            <span>{{ t('buy.usdt.network') }}</span>
            <span class="network-value">{{ networkType }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-btns">
          <button class="action-btn secondary" @click="saveImage">
            {{ t('buy.usdt.saveImage') }}
          </button>
          <button class="action-btn primary" @click="copyAddress">
            {{ t('buy.usdt.copyAddress') }}
          </button>
        </div>

        <!-- 最近购买记录 -->
        <div class="history-card">
          <div class="history-header" @click="showUsdtPreview = !showUsdtPreview">
            <span>{{ t('buy.usdt.title') }}</span>
            <span class="toggle-arrow">{{ showUsdtPreview ? '▲' : '▼' }}</span>
          </div>
          <div v-show="showUsdtPreview" class="history-list">
            <van-skeleton :loading="usdtPreviewLoading" :row="2">
              <div v-if="usdtPreviewList.length > 0">
                <div v-for="record in usdtPreviewList" :key="record.id" class="history-item">
                  <div class="history-info">
                    <span class="history-amount">{{ record.quantity }} USDT</span>
                    <span class="history-time">{{ formatDate(record.createAt) }}</span>
                  </div>
                  <span class="history-token">+{{ record.receiveTokenAmt }}</span>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>{{ t('buy.usdt.empty') }}</p>
              </div>
            </van-skeleton>
          </div>
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.buy-page {
  min-height: 100vh;
  background: #fff9f5;
}

.pull-refresh-wrap {
  min-height: calc(100vh - 46px);
}

.usdt-content {
  padding: 12px 16px;
}

.rate-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.rate-value {
  font-size: 18px;
  font-weight: 600;
  color: #ff9933;
}

.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.usdt-input-row {
  margin-bottom: 12px;
}

.usdt-input {
  width: 100%;
  padding: 14px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
}

.token-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-label {
  font-size: 12px;
  color: #999;
}

.result-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.qr-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 12px;
}

.qr-wrap {
  display: inline-block;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 12px;
}

.qr-img {
  width: 140px;
  height: 140px;
  display: block;
}

.qr-placeholder {
  width: 140px;
  height: 140px;
  margin: 0 auto 12px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.qr-tip {
  padding: 10px;
  background: #fff5eb;
  border-radius: 8px;
  font-size: 12px;
  color: #ff9933;
}

.field-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.address-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.address-text {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 11px;
  color: #333;
  word-break: break-all;
}

.copy-btn {
  padding: 8px 14px;
  background: #fff5eb;
  color: #ff9933;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.copy-btn:active {
  background: #ffead6;
}

.network-row {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
}

.network-value {
  color: #333;
  font-weight: 500;
}

.action-btns {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.action-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.action-btn.secondary {
  background: #fff;
  color: #666;
}

.action-btn.primary {
  background: #ff9933;
  color: #fff;
}

.action-btn.primary:active {
  background: #ff7700;
}

.history-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.toggle-arrow {
  font-size: 10px;
  color: #999;
}

.history-list {
  border-top: 1px solid #f0f0f0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  display: flex;
  flex-direction: column;
}

.history-amount {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.history-time {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.history-token {
  font-size: 14px;
  font-weight: 500;
  color: #2e9e2e;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>

<route lang="json5">
{
  name: 'BuyUsdt'
}
</route>
