/* eslint-disable */
<script setup lang="ts">
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { formatTime } from '@/utils/date'
import type { CliWithdrawOrder } from '@/api/buy'
import { getWithdrawOrder, submitBuy } from '@/api/buy'
import type { MchBankCfg } from '@/api/upi'
import { getBankOpts } from '@/api/upi'
import { dictLabel } from '@/utils/dict'

const loading = ref(false)
const { t } = useI18n()

// INR 相关
const currentLevel = ref('') // 当前选中的等级
const minAmount = ref('')
const maxAmount = ref('')
const showMinKeypad = ref(false)
const showMaxKeypad = ref(false)
const inrOrders = ref<CliWithdrawOrder[]>([])
const sortDesc = ref(true) // 是否倒序

// 等级筛选配置
const levelOptions = [
  { label: 'L1: 100-299', value: 'L1', min: '100', max: '299' },
  { label: 'L2: 300-499', value: 'L2', min: '300', max: '499' },
  { label: 'L3: 500-999', value: 'L3', min: '500', max: '999' },
  { label: 'L4: 1000-1999', value: 'L4', min: '1000', max: '1999' },
  { label: 'L5: 2000-4999', value: 'L5', min: '2000', max: '4999' },
  { label: 'L6: 5000-9999', value: 'L6', min: '5000', max: '9999' },
  { label: 'L7: 10000+', value: 'L7', min: '10000', max: '' },
]

// use pills instead of dropdown

function selectLevel(level: typeof levelOptions[0]) {
  currentLevel.value = level.value
  minAmount.value = level.min
  maxAmount.value = level.max
  loadInrOrders()
}

// 订单详情弹窗
const showDetail = ref(false)
const selectedOrder = ref<CliWithdrawOrder | null>(null)
const inputAmount = ref<number | string>('') // 可拆订单输入金额

// ctType 选项
const ctTypeOptions = ref<MchBankCfg[]>([])
const selectedCtType = ref('')
const showCtTypePicker = ref(false)

// picker 列格式
const ctTypePickerColumns = computed(() =>
  ctTypeOptions.value.map(opt => ({ text: opt.ctType, value: opt.ctType })),
)

// 计算可购买金额
function getAvailableAmount(order: CliWithdrawOrder): number {
  const orderAmt = Number(order.orderAmt || 0)
  const leftAmt = Number(order.leftAmt || 0)
  const available = orderAmt - leftAmt
  return Number.isFinite(available) ? Math.max(0, available) : 0
}

// 判断是否可拆（可买金额 >= minSplitAmt 且配置了拆分）
function isSplittable(order: CliWithdrawOrder): boolean {
  const available = getAvailableAmount(order)
  const minSplit = order.minSplitAmt || 0
  const hasSplitConfig = (order.splitCount || 0) > 1 || minSplit > 0
  // 可买金额 < 最小拆分金额时，变成不可拆模式
  return hasSplitConfig && available > minSplit
}

// 生成快捷金额按钮数组
function getQuickAmounts(order: CliWithdrawOrder): number[] {
  const available = getAvailableAmount(order)
  const minSplit = order.minSplitAmt || 0

  const half = Math.floor(available / 2)
  const amounts = new Set<number>()

  // 添加最小金额
  if (minSplit > 0)
    amounts.add(minSplit)
  // 添加一半（如果大于最小且小于全部）
  if (half > minSplit && half < available)
    amounts.add(half)
  // 添加全部
  amounts.add(available)

  return Array.from(amounts).sort((a, b) => a - b)
}

const refreshing = ref(false)

async function loadCtTypeOptions() {
  try {
    const res = await getBankOpts()
    if (res.code === '200') {
      ctTypeOptions.value = res.data || []
    }
  }
  catch {
    console.error('Failed to load ctType options')
  }
}

onMounted(async () => {
  // 使用 nextTick 延迟数据加载，让页面先渲染
  await nextTick()

  // 默认选中第一个等级 (L1)
  if (levelOptions.length > 0) {
    const defaultLevel = levelOptions[0]
    currentLevel.value = defaultLevel.value
    minAmount.value = defaultLevel.min
    maxAmount.value = defaultLevel.max
  }

  // 加载 ctType 选项
  await loadCtTypeOptions()

  await loadInrOrders()
})

async function loadInrOrders() {
  loading.value = true
  try {
    const res = await getWithdrawOrder({
      minAmount: Number(minAmount.value),
      maxAmount: Number(maxAmount.value),
      limit: 200,
      desc: sortDesc.value,
    })
    if (res.code === '200') {
      inrOrders.value = res.data || []
    }
  }
  catch {
    showToast({ message: 'Failed to load orders', type: 'fail' })
    inrOrders.value = []
  }
  finally {
    loading.value = false
  }
}

// 打开订单详情
function openOrderDetail(order: CliWithdrawOrder) {
  selectedOrder.value = order
  inputAmount.value = ''
  // 设置默认 ctType（取第一个选项）
  selectedCtType.value = ctTypeOptions.value.length > 0 ? ctTypeOptions.value[0].ctType : ''
  showDetail.value = true
}

// 关闭订单详情
function closeOrderDetail() {
  showDetail.value = false
  selectedOrder.value = null
  inputAmount.value = ''
  selectedCtType.value = ''
}

// ctType picker 确认
function onCtTypeConfirm({ selectedOptions }: { selectedOptions: { text: string, value: string }[] }) {
  // eslint-disable-next-line no-console
  console.log('selectedOptions', selectedOptions)
  showCtTypePicker.value = false
  if (selectedOptions?.[0]) {
    selectedCtType.value = selectedOptions[0].value
  }
}

// 复制订单号
function copyOrderNo(orderNo: string) {
  navigator.clipboard.writeText(orderNo)
  showToast({ message: 'Order No copied', type: 'success' })
}

// 复制 UPI 账号
function copyUpiAccount(upi: string) {
  navigator.clipboard.writeText(upi)
  showToast({ message: 'UPI copied', type: 'success' })
}

// 接单操作
const submitting = ref(false)

async function handleTakeOrder(order: CliWithdrawOrder) {
  const availableAmt = getAvailableAmount(order)
  const amount = isSplittable(order) ? Number(inputAmount.value) : availableAmt

  // 验证 ctType
  if (!selectedCtType.value) {
    showToast({ message: t('buy.error.selectCtType'), type: 'fail' })
    return
  }

  // 验证金额
  if (isSplittable(order)) {
    if (!amount || amount <= 0) {
      showToast({ message: t('buy.error.enterAmount'), type: 'fail' })
      return
    }
    if (amount > availableAmt) {
      showToast({ message: `${t('buy.error.maxAmount')}: ₹${formatInr(availableAmt)}`, type: 'fail' })
      return
    }
    if (order.minSplitAmt && amount < order.minSplitAmt) {
      showToast({ message: `${t('buy.error.minAmount')}: ₹${formatInr(order.minSplitAmt)}`, type: 'fail' })
      return
    }
  }

  if (submitting.value)
    return
  submitting.value = true

  try {
    const res = await submitBuy({
      amount,
      ctType: selectedCtType.value,
      orderNo: order.orderNo,
    })
    if (res.code === '200') {
      showToast({ message: t('buy.success.orderSubmitted'), type: 'success' })
      closeOrderDetail()
      await loadInrOrders()
    }
    else {
      showToast({ message: res.msg || t('buy.error.submitFailed'), type: 'fail' })
    }
  }
  catch {
    showToast({ message: t('buy.error.submitFailed'), type: 'fail' })
  }
  finally {
    submitting.value = false
  }
}

function formatInr(val: any, digits = 2) {
  const num = Number(val)
  if (!Number.isFinite(num))
    return '0.00'
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(num)
}

function formatDate(timestamp: string) {
  return formatTime(timestamp)
}

async function onRefresh() {
  try {
    await loadInrOrders()
  }
  finally {
    refreshing.value = false
  }
}
</script>

<template>
  <div class="buy-page">
    <div class="sticky top-0 z-50 w-full bg-white">
      <van-nav-bar
        title="Buy"
        :border="false"
      />
      <!-- INR 筛选栏 -->
      <div class="filter-bar-wrap sticky-tab">
        <div class="tabs-scroll-container">
          <button
            v-for="level in levelOptions"
            :key="level.value"
            class="level-pill"
            :class="{ active: currentLevel === level.value }"
            @click="selectLevel(level)"
          >
            <span class="pill-label">{{ level.value }}</span>
          </button>
        </div>

        <div class="history-icon" @click.stop="$router.push('/buy/history')">
          <div class="icon-circle">
            <div class="i-carbon:time text-lg text-white" />
          </div>
        </div>
      </div>
    </div>

    <van-pull-refresh v-model="refreshing" class="pull-refresh-wrap" @refresh="onRefresh">

      <!-- INR 内容 -->
      <div class="order-list">
        <van-skeleton :loading="loading" :row="5">
          <div v-if="inrOrders.length > 0" class="space-y-3">
            <div
              v-for="order in inrOrders"
              :key="order.id"
              class="order-card"
              @click="openOrderDetail(order)"
            >
              <!-- 顶部：金额 + 接单按钮 -->
              <div class="mb-3 flex items-center justify-between">
                <div class="flex gap-1 items-baseline">
                  <span class="text-2xl text-[#ff7700] font-bold">₹{{ formatInr(getAvailableAmount(order), 0) }}</span>
                </div>
                <button class="receive-btn">
                  <span class="i-carbon:arrow-right text-sm" />
                  Receive
                </button>
              </div>

              <!-- 中间：订单号 -->
              <div class="mb-2 flex gap-2 items-center">
                <span class="text-xs text-gray-400">ID:</span>
                <span class="text-xs text-gray-600 font-mono">{{ order.orderNo }}</span>
              </div>

              <!-- 底部：奖励信息 -->
              <div class="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div class="flex gap-1.5 items-center">
                  <span class="i-carbon:gift text-[#ff9933]" />
                  <span class="text-xs text-gray-500">Award</span>
                </div>
                <div class="flex gap-1 items-center">
                  <span class="reward-tag">+{{ order.rewardAmt || 0 }}</span>
                  <span class="reward-tag-fixed">+{{ order.rewardFixedAmt || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-circle" />
            <p class="empty-text">
              No orders available
            </p>
          </div>
        </van-skeleton>
      </div>

      <!-- 数字键盘 -->
      <van-number-keyboard
        v-model="minAmount"
        :show="showMinKeypad"
        :extra-key="['.']"
        close-button-text="Ok"
        theme="custom"
        @blur="showMinKeypad = false"
      />
      <van-number-keyboard
        v-model="maxAmount"
        :show="showMaxKeypad"
        :extra-key="['.']"
        close-button-text="Ok"
        theme="custom"
        @blur="showMaxKeypad = false"
      />

      <!-- 订单详情弹窗 -->
      <van-popup v-model:show="showDetail" round position="bottom" :style="{ maxHeight: '80vh' }">
        <div v-if="selectedOrder" class="popup-content">
          <!-- 弹窗头部 -->
          <div class="popup-header">
            <span class="popup-title">Order Details</span>
            <button class="close-btn" @click="closeOrderDetail">
              ×
            </button>
          </div>

          <!-- 弹窗内容 -->
          <div class="popup-body">
            <!-- 金额区域 -->
            <div class="detail-card">
              <div class="amount-display">
                <span class="amount-label">{{ isSplittable(selectedOrder) ? 'Available' : 'Amount' }}</span>
                <span class="amount-value">₹{{ formatInr(getAvailableAmount(selectedOrder), 0) }}</span>
              </div>

              <!-- 可拆订单：显示输入框 -->
              <div v-if="isSplittable(selectedOrder)" class="split-section">
                <span class="input-label">Enter amount</span>
                <div class="amount-input-wrap">
                  <span class="input-prefix">₹</span>
                  <input
                    v-model="inputAmount"
                    type="number"
                    :placeholder="`${selectedOrder.minSplitAmt} - ${getAvailableAmount(selectedOrder)}`"
                    class="amount-input"
                  >
                </div>
                <div class="quick-amounts">
                  <button
                    v-for="amt in getQuickAmounts(selectedOrder)"
                    :key="amt"
                    class="quick-btn"
                    @click="inputAmount = amt"
                  >
                    ₹{{ formatInr(amt, 0) }}
                  </button>
                </div>
              </div>
            </div>

            <!-- ctType 选择 -->
            <div class="detail-card">
              <span class="field-label">Type</span>
              <div class="select-field" @click="showCtTypePicker = true">
                <span :class="selectedCtType ? 'selected' : 'placeholder'">
                  {{ selectedCtType || 'Select' }}
                </span>
                <span class="select-arrow">▼</span>
              </div>
            </div>

            <!-- 收款人 -->
            <div class="detail-card">
              <span class="field-label">Pay to</span>
              <div class="payee-info">
                <div class="payee-text">
                  <span class="payee-name">{{ selectedOrder.realName || '-' }}</span>
                  <span class="payee-upi">{{ selectedOrder.upiAccount || '-' }}</span>
                </div>
                <button
                  v-if="selectedOrder.upiAccount"
                  class="copy-btn"
                  @click="copyUpiAccount(selectedOrder.upiAccount)"
                >
                  COPY
                </button>
              </div>
            </div>

            <!-- 订单信息 -->
            <div class="detail-card">
              <div class="info-row">
                <span class="info-label">Order No</span>
                <button class="info-value clickable" @click="copyOrderNo(selectedOrder.orderNo)">
                  {{ selectedOrder.orderNo }}
                </button>
              </div>
              <div class="info-row">
                <span class="info-label">Status</span>
                <span class="info-value status">{{ dictLabel('CliOrderStatus', selectedOrder.status) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Time</span>
                <span class="info-value">{{ formatDate(selectedOrder.createAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="popup-footer">
            <button
              class="confirm-btn"
              :class="{ disabled: (isSplittable(selectedOrder) && !inputAmount) || submitting }"
              :disabled="submitting"
              @click="handleTakeOrder(selectedOrder)"
            >
              <span v-if="submitting">Submitting...</span>
              <span v-else-if="isSplittable(selectedOrder) && inputAmount">Confirm ₹{{ formatInr(Number(inputAmount), 0) }}</span>
              <span v-else-if="isSplittable(selectedOrder)">Enter amount</span>
              <span v-else>Confirm ₹{{ formatInr(getAvailableAmount(selectedOrder), 0) }}</span>
            </button>
          </div>

          <van-popup v-model:show="showCtTypePicker" round position="bottom">
            <van-picker
              :columns="ctTypePickerColumns"
              @confirm="onCtTypeConfirm"
              @cancel="showCtTypePicker = false"
            />
          </van-popup>
        </div>
      </van-popup>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.buy-page {
  min-height: 100vh;
  background: #fff9f5;
}

.sticky-tab {
  position: sticky;
  top: 0;
  z-index: 10;
}

.pull-refresh-wrap {
  min-height: calc(100vh - 46px);
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.tab-item {
  flex: 1;
  padding: 14px 0;
  font-size: 14px;
  font-weight: 500;
  color: #999;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-item.active {
  color: #ff9933;
  border-bottom-color: #ff9933;
}

/* 筛选栏容器 */
.filter-bar-wrap {
  background: #ff9933;
  padding: 12px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 20;
}

.tabs-scroll-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  white-space: nowrap;
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-scroll-container::-webkit-scrollbar {
  display: none;
}

.level-tabs {
  display: none; /* Deprecated */
}

.level-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  min-width: 0;
}

.level-pill.active {
  background: #fff;
  color: #ff9933;
}

.pill-amt {
  font-weight: 700;
  color: #fff;
}

.pill-label {
  font-weight: 700;
}

.history-icon {
  flex-shrink: 0;
  cursor: pointer;
  padding-left: 0;
}

.icon-circle {
  width: 28px; /* Slightly smaller to fit inside header */
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8); /* White border for contrast on orange/transparent */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.icon-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: none;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); /* Shadow for visibility */
}

/* 订单列表 */
.order-list {
  padding: 12px 16px;
}

.order-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 12px rgba(255, 153, 51, 0.08);
  border: 1px solid rgba(255, 153, 51, 0.1);
}

.order-card:active {
  transform: scale(0.98);
  background: #fffaf7;
}

.receive-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff9933 0%, #ff7700 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 119, 0, 0.3);
}

.reward-tag {
  padding: 2px 8px;
  background: #fff5eb;
  color: #ff9933;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}

.reward-tag-fixed {
  padding: 2px 8px;
  background: #f0fdf4;
  color: #16a34a;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.empty-circle {
  width: 140px;
  height: 140px;
  background: #fff9f2;
  border-radius: 50%;
}

.empty-text {
  color: #6f7a89;
  font-size: 16px;
  font-weight: 500;
}

/* 弹窗 */
.popup-content {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  background: #fff9f5;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.popup-body {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.amount-display {
  text-align: center;
  margin-bottom: 16px;
}

.amount-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.amount-value {
  font-size: 32px;
  font-weight: 700;
  color: #ff7700;
  font-variant-numeric: tabular-nums;
}

.split-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.input-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0 12px;
  margin-bottom: 12px;
}

.input-prefix {
  font-size: 16px;
  color: #999;
  margin-right: 8px;
}

.amount-input {
  flex: 1;
  padding: 14px 0;
  font-size: 18px;
  font-weight: 600;
  background: none;
  border: none;
  outline: none;
}

.quick-amounts {
  display: flex;
  gap: 8px;
}

.quick-btn {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
}

.quick-btn:active {
  background: #eee;
}

.field-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.select-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
}

.select-field .selected {
  font-size: 14px;
  color: #333;
}

.select-field .placeholder {
  font-size: 14px;
  color: #999;
}

.select-arrow {
  font-size: 10px;
  color: #999;
}

.payee-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payee-text {
  flex: 1;
  min-width: 0;
}

.payee-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.payee-upi {
  display: block;
  font-size: 12px;
  color: #999;
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

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
}

.info-row .info-label {
  font-size: 12px;
  color: #999;
}

.info-row .info-value {
  font-size: 12px;
  color: #666;
  background: none;
  border: none;
  cursor: default;
}

.info-row .info-value.clickable {
  cursor: pointer;
}

.info-row .info-value.status {
  color: #ff9933;
}

.popup-footer {
  padding: 16px;
  background: #fff;
}

.confirm-btn {
  width: 100%;
  padding: 14px;
  background: #ff9933;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-btn:active {
  background: #ff7700;
}

.confirm-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

<route lang="json5">
{
  name: 'Buy',
  meta: {
    hideNavbar: true
  }
}
</route>
