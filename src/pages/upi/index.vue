<script setup lang="ts">
import { showToast } from 'vant'
import type { MbrUpi } from '@/api/upi'
import { getUpiList, reLink, switchSell } from '@/api/upi'
import { sendOtp } from '@/api/user'

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

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const refreshing = ref(false)
const upiList = ref<MbrUpi[]>([])
const showOperateDialog = ref(false)
const currentUpi = ref<MbrUpi | null>(null)
const showRelinkOtpDialog = ref(false)
const relinkOtpCode = ref('')

onMounted(async () => {
  // 使用 nextTick 延迟数据加载，让页面先渲染
  await nextTick()
  await loadUpiList()
})

async function loadUpiList() {
  try {
    loading.value = true
    const res = await getUpiList()
    if (res.code === '200')
      upiList.value = res.data || []
  }
  finally {
    loading.value = false
  }
}

async function onRefresh() {
  refreshing.value = true
  try {
    const res = await getUpiList()
    if (res.code === '200')
      upiList.value = res.data || []
  }
  finally {
    refreshing.value = false
  }
}

function goToLinkNewUpi() {
  router.push('/upi/link')
}

function showOperate(upi: MbrUpi) {
  currentUpi.value = upi
  showOperateDialog.value = true
}

async function handleRelink() {
  if (!currentUpi.value)
    return
  try {
    const s = await sendOtp()
    if (s.code === '200')
      showRelinkOtpDialog.value = true
  }
  catch {
    showToast({ message: t('upi.index.toast.relinkFailed'), type: 'fail' })
  }
  finally {
    showOperateDialog.value = false
  }
}

async function confirmRelinkOtp() {
  const otp = String(relinkOtpCode.value).trim()
  if (!/^\d{6}$/.test(otp)) {
    showToast({ message: t('upi.index.toast.invalidOtp'), type: 'fail' })
    return
  }
  if (!currentUpi.value)
    return
  try {
    const res = await reLink({ id: currentUpi.value.id, otp })
    if (res.code === '200') {
      showToast({ message: t('upi.index.toast.relinkSuccess'), type: 'success' })
      await loadUpiList()
    }
  }
  catch {
    showToast({ message: t('upi.index.toast.relinkFailed'), type: 'fail' })
  }
  finally {
    showRelinkOtpDialog.value = false
    relinkOtpCode.value = ''
  }
}

async function handleStartSell() {
  if (!currentUpi.value)
    return
  try {
    const res = await switchSell({ id: currentUpi.value.id })
    if (res.code === '200') {
      showToast({ message: t('upi.index.toast.statusUpdated'), type: 'success' })
      await loadUpiList()
    }
  }
  catch {
    showToast({ message: t('upi.index.toast.updateFailed'), type: 'fail' })
  }
  finally {
    showOperateDialog.value = false
  }
}

function isOnline(linkStatus: string) {
  return linkStatus === '1'
}

function getStatusText(upi: MbrUpi) {
  return isOnline(upi.linkStatus) ? t('upi.index.statusOnline') : t('upi.index.statusOffline')
}

function getStatusColor(upi: MbrUpi) {
  return isOnline(upi.linkStatus) ? 'bg-green-500' : 'bg-gray-400'
}

function getSellStatusColor(upi: MbrUpi) {
  return upi.userSell ? 'bg-blue-500' : 'bg-yellow-500'
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

function goToDetail(upi: MbrUpi) {
  router.push(`/upi/detail?id=${upi.id}`)
}

function goToSell() {
  router.push('/sell')
}
</script>

<template>
  <div class="bg-[#FFF9F5] min-h-screen">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 主内容区 -->
      <div class="px-3 py-3">
        <!-- 提示信息 -->
        <div class="mb-3 p-3 border border-red-100 rounded-2xl bg-red-50">
          <div class="flex gap-2 items-start">
            <div class="i-carbon:warning text-lg text-red-500" />
            <p class="text-sm text-red-600">
              {{ t('upi.index.headerWarning') }}
            </p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="mb-3 flex gap-3">
          <button class="border-2 border-[#FF9933] rounded-2xl bg-white flex flex-1 flex-col gap-2 h-18 shadow-sm items-center justify-center">
            <div class="i-carbon:video text-2xl text-[#FF9933]" />
            <span class="text-sm text-[#FF9933] font-500">{{ t('upi.index.tutorial') }}</span>
          </button>
          <button class="rounded-2xl bg-[#FF9933] flex flex-1 flex-col gap-2 h-18 shadow-sm items-center justify-center active:bg-[#E68A2E]" @click="goToLinkNewUpi">
            <div class="i-carbon:link text-2xl text-white" />
            <span class="text-sm text-white font-500">{{ t('upi.index.linkNewUpi') }}</span>
          </button>
        </div>

        <!-- UPI 列表 -->
        <van-skeleton :loading="loading" :row="3">
          <div v-for="upi in upiList" :key="upi.id" class="mb-3 rounded-2xl bg-white shadow-sm overflow-hidden">
            <div class="p-4">
              <!-- UPI 信息头部 -->
              <div class="mb-3 flex items-start justify-between">
                <div class="flex flex-1 gap-3 items-center">
                  <div class="border border-gray-100 rounded-xl bg-white flex h-14 w-14 shadow-sm items-center justify-center overflow-hidden">
                    <img v-if="getBankIcon(upi.ctType)" :src="getBankIcon(upi.ctType)" class="p-1 h-full w-full object-contain">
                    <div v-else class="flex h-full w-full items-center justify-center from-[#FF9933] to-[#138808] bg-gradient-to-br">
                      <div class="i-carbon:wallet text-2xl text-white" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-base text-gray-900 font-600 mb-1">
                      {{ getBankName(upi.ctType) }}
                    </div>
                    <div class="text-sm text-[#FF9933] font-500 truncate">
                      {{ upi.upiNo }}
                    </div>
                    <div class="text-xs text-gray-400 mt-0.5 truncate">
                      {{ upi.account }}
                    </div>
                  </div>
                </div>
                <div class="ml-2 flex flex-col gap-2 items-end">
                  <div class="px-2.5 py-1 rounded-full flex gap-1.5 items-center" :class="[isOnline(upi.linkStatus) ? 'bg-[#F0FDF0]' : 'bg-gray-100']">
                    <div class="rounded-full h-2 w-2" :class="getStatusColor(upi)" />
                    <span class="text-xs font-500" :class="[isOnline(upi.linkStatus) ? 'text-[#138808]' : 'text-gray-600']">
                      {{ getStatusText(upi) }}
                    </span>
                  </div>
                  <div class="px-2.5 py-1 rounded-full flex gap-1.5 cursor-pointer select-none items-center" :class="[upi.userSell ? 'bg-[#FFF3E6]' : 'bg-gray-100']" @click="goToSell">
                    <div class="rounded-full h-2 w-2" :class="getSellStatusColor(upi)" />
                    <span class="text-xs font-500" :class="[upi.userSell ? 'text-[#FF9933]' : 'text-gray-600']">
                      {{ upi.userSell ? t('upi.index.sellingLabel') : t('upi.index.stoppedLabel') }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 警告提示 -->
              <div v-if="!isOnline(upi.linkStatus)" class="mb-3 p-3 border border-red-100 rounded-xl bg-red-50">
                <div class="flex gap-2 items-start">
                  <div class="i-carbon:warning text-base text-red-500" />
                  <span class="text-sm text-red-600">{{ t('upi.index.offlineWarning') }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-3 items-center">
                <button class="px-4 py-3 border border-[#FFE4CC] rounded-xl bg-[#FFF9F5] flex flex-1 gap-2 items-center justify-center active:bg-orange-100" @click="showOperate(upi)">
                  <div class="i-carbon:settings text-base text-gray-700" />
                  <span class="text-sm text-gray-700 font-500">{{ t('upi.index.manage') }}</span>
                </button>
                <button class="px-4 py-3 rounded-xl bg-[#FF9933] flex flex-1 gap-2 items-center justify-center active:bg-[#E68A2E]" @click="goToDetail(upi)">
                  <div class="i-carbon:document text-base text-white" />
                  <span class="text-sm text-white font-500">{{ t('upi.index.details') }}</span>
                </button>
              </div>
            </div>
          </div>
        </van-skeleton>
      </div>
    </van-pull-refresh>

    <!-- 操作弹窗 -->
    <van-action-sheet v-model:show="showOperateDialog" :title="t('upi.index.actionSheetTitle')">
      <div class="p-4 space-y-3">
        <van-button type="primary" plain block @click="handleRelink">
          {{ t('upi.index.relink') }}
        </van-button>
        <van-button block @click="handleStartSell">
          {{ t('upi.index.startSell') }}
        </van-button>
        <van-button plain block @click="showOperateDialog = false">
          {{ t('upi.index.cancel') }}
        </van-button>
      </div>
    </van-action-sheet>
    <van-dialog v-model:show="showRelinkOtpDialog" :title="t('upi.index.otpTitle')" show-cancel-button @confirm="confirmRelinkOtp">
      <div class="p-3">
        <van-field v-model="relinkOtpCode" :placeholder="t('upi.index.otpPlaceholder')" type="number" maxlength="6" input-align="center" />
      </div>
    </van-dialog>
  </div>
</template>

<route lang="json5">
{
  name: 'UPI'
}
</route>
