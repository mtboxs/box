<script setup lang="ts">
import { showToast } from 'vant'
import type { MbrPayInOrder, MbrUpi } from '@/api/upi'
import { getLatest10, getUpiList } from '@/api/upi'
import { dictLabel } from '@/utils/dict'

import imgIndusPay from '@/assets/images/IndusPay.png'
import imgAirtel from '@/assets/images/airtel.jpg'
import imgFreecharge from '@/assets/images/freecharge.png'
import imgPhonepe from '@/assets/images/phonepe.png'
import imgPaytm from '@/assets/images/paytm.png'
import imgMobikwik from '@/assets/images/mobikwik.png'
import imgUtk from '@/assets/images/utkarsh.jpg'
import imgEsaf from '@/assets/images/esaf.png'
import imgJio from '@/assets/images/jiof.jpg'
import imgSlice from '@/assets/images/slice.png'

const route = useRoute()
const router = useRouter()
const upiId = Number(route.query.id)

const upiDetail = ref<MbrUpi | null>(null)
const orderList = ref<MbrPayInOrder[]>([])
const loading = ref(false)
const showOrderList = ref(true)

onMounted(async () => {
  // 使用 nextTick 延迟数据加载，让页面先渲染
  await nextTick()
  await loadData()
})

async function loadData() {
  try {
    loading.value = true
    // 获取 UPI 详情
    const upiRes = await getUpiList()
    if (upiRes.code === '200') {
      const allUpis = upiRes.data || []
      upiDetail.value = allUpis.find(upi => upi.id === upiId) || null
    }

    // 获取最近10条交易记录
    const orderRes = await getLatest10({ id: upiId })
    if (orderRes.code === '200') {
      orderList.value = orderRes.data || []
    }
  }
  catch (error) {
    showToast({ message: 'Failed to load data', type: 'fail' })
  }
  finally {
    loading.value = false
  }
}

function getBankIcon(ctType: string) {
  const icons: Record<string, string> = {
    'induspay': imgIndusPay,
    'airtel': imgAirtel,
    'freecharge': imgFreecharge,
    'phonepe': imgPhonepe,
    'paytm': imgPaytm,
    'mobikwik': imgMobikwik,
    'utk': imgUtk,
    'esaf': imgEsaf,
    'esaf upi': imgEsaf,
    'jio': imgJio,
    'jio finance': imgJio,
    'slice': imgSlice,
  }
  return icons[ctType?.toLowerCase()] || ''
}

function getBankName(ctType: string) {
  const names: Record<string, string> = {
    induspay: 'IndusPay',
    airtel: 'Airtel',
    freecharge: 'Freecharge',
    phonepe: 'Phonepe',
    paytm: 'Paytm',
    mobikwik: 'Mobikwik',
    utk: 'UTK',
    esaf: 'ESAF UPI',
    jio: 'Jio Finance',
    slice: 'Slice',
  }
  return names[ctType?.toLowerCase()] || ctType
}

function isOnline(linkStatus: string | number) {
  return String(linkStatus) === '1'
}

function formatDate(timestamp: string | number) {
  if (!timestamp)
    return '-'
  const date = new Date(Number(timestamp))
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

function getOrderStateText(status: string) {
  const states: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  }
  const isNumeric = /^\d+$/.test(String(status))
  if (isNumeric)
    return dictLabel('PayTaskStatus', status)
  return states[status] || status || '-'
}

function getOrderStateColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'text-yellow-600',
    processing: 'text-blue-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
  }
  return colors[status] || 'text-gray-600'
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <NavBar title="UPI Details" />

    <van-skeleton :loading="loading" :row="8">
      <div v-if="upiDetail" class="p-2 space-y-2">
        <!-- UPI 信息卡片 -->
        <div class="p-2 rounded-xl bg-white shadow-sm">
          <div class="flex gap-2 items-center">
            <div class="border border-gray-100 rounded-xl bg-white flex h-10 w-10 shadow-sm items-center justify-center overflow-hidden">
              <img v-if="getBankIcon(upiDetail.ctType)" :src="getBankIcon(upiDetail.ctType)" class="p-1 h-full w-full object-contain">
              <div v-else class="bg-blue-500 flex h-full w-full items-center justify-center">
                <div class="i-carbon:wallet text-xl text-white" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-gray-900 font-600">
                {{ getBankName(upiDetail.ctType) }}
              </div>
              <div class="text-xs text-[#FF9933] font-500 truncate">
                {{ upiDetail.upiNo }}
              </div>
            </div>
          </div>
        </div>

        <!-- Last 10 trading orders -->
        <div class="p-2 rounded-xl bg-white shadow-sm">
          <div class="mb-2 flex cursor-pointer items-center justify-between" @click="showOrderList = !showOrderList">
            <h3 class="text-sm text-gray-900 font-600">
              Last 10 trading orders
            </h3>
            <div
              class="text-base text-gray-400 transition-transform duration-300"
              :class="[showOrderList ? 'i-carbon:chevron-up' : 'i-carbon:chevron-down']"
            />
          </div>

          <div v-show="showOrderList">
            <!-- 订单表头 -->
            <div class="mb-2 pb-1 border-b border-gray-200 gap-2 grid grid-cols-3">
              <div class="text-xs text-gray-700 font-500">
                Order No
              </div>
              <div class="text-xs text-gray-700 font-500">
                Order State
              </div>
              <div class="text-xs text-gray-700 font-500 text-right">
                Deal Date
              </div>
            </div>

            <!-- 订单列表 -->
            <div v-if="orderList.length > 0" class="space-y-1">
              <div v-for="order in orderList" :key="order.id" class="py-1 gap-2 grid grid-cols-3">
                <div class="text-xs text-gray-900 truncate">
                  {{ order.orderNo || '-' }}
                </div>
                <div class="text-xs font-600" :class="getOrderStateColor(order.payTaskStatus)">
                  {{ getOrderStateText(order.payTaskStatus) }}
                </div>
                <div class="text-xs text-gray-900 text-right">
                  {{ formatDate(order.createAt) }}
                </div>
              </div>
            </div>
            <div v-else class="text-xs text-gray-500 py-3 text-center">
              No orders yet
            </div>
          </div>
        </div>

        <!-- UPI 详细信息 -->
        <div class="p-2 rounded-xl bg-white shadow-sm space-y-2">
          <!-- Allocation Quota -->
          <div class="py-2 border-b border-gray-100 flex items-center justify-between">
            <span class="text-xs text-gray-700 font-500">Allocation Quota</span>
            <span class="text-sm text-gray-900 font-600">{{ upiDetail.allocationQuota || 0 }}</span>
          </div>

          <!-- Min Single Transaction -->
          <div class="py-2 border-b border-gray-100 flex items-center justify-between">
            <span class="text-xs text-gray-700 font-500">Min Single Transaction</span>
            <span class="text-sm text-gray-900 font-600">{{ upiDetail.minSingleTransaction || 0 }}</span>
          </div>

          <!-- In Sell -->
          <div class="py-2 border-b border-gray-100 flex cursor-pointer select-none items-center justify-between" @click="router.push('/sell')">
            <span class="text-xs text-gray-700 font-500">In Sell</span>
            <div v-if="upiDetail.userSell" class="rounded-full bg-green-500 flex h-5 w-5 items-center justify-center">
              <div class="i-carbon:checkmark text-sm text-white" />
            </div>
            <div v-else class="rounded-full bg-red-500 flex h-5 w-5 items-center justify-center">
              <div class="i-carbon:close text-sm text-white" />
            </div>
          </div>

          <!-- Lock Time -->
          <div class="py-2 border-b border-gray-100 flex items-center justify-between">
            <span class="text-xs text-gray-700 font-500">Lock Time</span>
            <div v-if="upiDetail.locked || upiDetail.lastLockedAt" class="rounded-full bg-green-500 flex h-5 w-5 items-center justify-center">
              <div class="i-carbon:checkmark text-sm text-white" />
            </div>
            <div v-else class="rounded-full bg-gray-300 flex h-5 w-5 items-center justify-center">
              <div class="i-carbon:close text-sm text-white" />
            </div>
          </div>

          <!-- Online -->
          <div class="py-2 flex items-center justify-between">
            <span class="text-xs text-gray-700 font-500">Online</span>
            <div v-if="isOnline(upiDetail.linkStatus)" class="rounded-full bg-green-500 flex h-5 w-5 items-center justify-center">
              <div class="i-carbon:checkmark text-sm text-white" />
            </div>
            <div v-else class="rounded-full bg-red-500 flex h-5 w-5 items-center justify-center">
              <div class="i-carbon:close text-sm text-white" />
            </div>
          </div>

          <!-- 离线警告 -->
          <div v-if="!isOnline(upiDetail.linkStatus)" class="mt-2 p-2 border border-red-100 rounded-lg bg-red-50">
            <p class="text-xs text-red-600">
              Please make a payment to this UPI of more than ₹168 to activate the account online.
            </p>
          </div>
        </div>
      </div>
    </van-skeleton>
  </div>
</template>

<route lang="json5">
{
  name: 'UpiDetail'
}
</route>
