<script setup lang="ts">
import { showToast } from 'vant'
import type { MchBankCfg } from '@/api/upi'
import { addUpi, getBankOpts } from '@/api/upi'
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
const bankOptions = ref<MchBankCfg[]>([])
const showBankPicker = ref(false)
const selectedBank = ref<MchBankCfg | null>(null)
const formData = ref({
  realName: '',
  upiNo: '',
})
const showOtpDialog = ref(false)
const otpCode = ref('')

onMounted(async () => {
  // 使用 nextTick 延迟数据加载，让页面先渲染
  await nextTick()
  await loadBankOptions()
})

async function loadBankOptions() {
  try {
    const res = await getBankOpts()
    if (res.code === '200') {
      const list = res.data || []
      const order = [
        'induspay',
        'airtel',
        'freecharge',
        'phonepe',
        'paytm',
        'mobikwik',
        'utk',
        'esaf',
        'jio',
        'slice',
      ]

      bankOptions.value = list.sort((a, b) => {
        const typeA = String(a.ctType || '').toLowerCase()
        const typeB = String(b.ctType || '').toLowerCase()
        const indexA = order.indexOf(typeA)
        const indexB = order.indexOf(typeB)

        // If not found in order list, place at the end
        const valA = indexA === -1 ? 999 : indexA
        const valB = indexB === -1 ? 999 : indexB

        return valA - valB
      })
    }
  }
  catch {
    showToast({ message: 'Failed to load bank options', type: 'fail' })
  }
}

function selectBank(bank: MchBankCfg) {
  selectedBank.value = bank
  showBankPicker.value = false
}

function getBankKey(bank: MchBankCfg | null | undefined) {
  if (!bank)
    return ''
  const id = (bank as any).id
  const ct = String(bank.ctType || '').toLowerCase()
  if (id !== undefined && id !== null && `${id}` !== '')
    return `id:${id}|ct:${ct}`
  return `ct:${ct}`
}

async function handleLinkKyc() {
  if (!selectedBank.value) {
    showToast({ message: t('upi.link.toast.selectPartner'), type: 'fail' })
    return
  }
  if (!formData.value.realName) {
    showToast({ message: t('upi.link.toast.enterName'), type: 'fail' })
    return
  }
  if (!formData.value.upiNo) {
    showToast({ message: t('upi.link.toast.enterUpi'), type: 'fail' })
    return
  }

  try {
    const s = await sendOtp()
    if (s.code === '200')
      showOtpDialog.value = true
  }
  catch {
    showToast({ message: t('upi.link.toast.linkFailed'), type: 'fail' })
  }
}

async function handleConfirmOtp() {
  if (!otpCode.value) {
    showToast({ message: t('upi.link.toast.enterOtp'), type: 'fail' })
    return
  }
  const otp = String(otpCode.value).trim()
  if (!/^\d{6}$/.test(otp)) {
    showToast({ message: t('upi.link.toast.invalidOtp'), type: 'fail' })
    return
  }

  try {
    const upi = String(formData.value.upiNo).trim()
    const res = await addUpi({
      ctType: selectedBank.value!.ctType,
      realName: formData.value.realName,
      upiNo: upi,
      otp,
    })
    if (res.code === '200') {
      showToast({ message: t('upi.link.toast.linkSuccess'), type: 'success' })
      router.back()
    }
  }
  catch {
    showToast({ message: t('upi.link.toast.otpFailed'), type: 'fail' })
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

function getBankDescription(ctType: string) {
  return `${getBankName(ctType)} is an Indian digital payment platform.`
}
</script>

<template>
  <div class="bg-white min-h-screen">
    <div class="p-3 space-y-3">
      <van-cell-group>
        <van-field
          :label="t('upi.link.partnerLabel')"
          :model-value="selectedBank ? getBankName(selectedBank.ctType) : ''"
          :placeholder="t('upi.link.partnerPlaceholder')"
          readonly
          is-link
          @click="showBankPicker = true"
        />
        <van-field
          v-model="formData.realName"
          :label="t('upi.link.nameLabel')"
          :placeholder="t('upi.link.namePlaceholder')"
          input-align="right"
          maxlength="48"
        />
        <van-field
          v-model="formData.upiNo"
          :label="t('upi.link.upiLabel')"
          :placeholder="t('upi.link.upiPlaceholder')"
          input-align="right"
          maxlength="64"
        />
      </van-cell-group>

      <van-button block color="#FF9933" @click="handleLinkKyc">
        {{ t('upi.link.linkButton') }}
      </van-button>
    </div>

    <!-- Bank Picker Popup -->
    <van-popup v-model:show="showBankPicker" position="bottom" :style="{ height: '80%' }">
      <div class="p-3">
        <h2 class="text-base text-gray-900 font-600 mb-3">
          {{ t('upi.link.chooseTitle') }}
        </h2>
        <div class="space-y-2">
          <div
            v-for="bank in bankOptions"
            :key="getBankKey(bank)"
            class="p-2 border rounded-xl bg-white flex cursor-pointer transition-colors items-center justify-between hover:bg-gray-50"
            :class="{ 'border-[#FF9933] bg-[#FFF9F5] ring-1 ring-[#FFD6A3]': getBankKey(selectedBank) === getBankKey(bank), 'border-gray-200': getBankKey(selectedBank) !== getBankKey(bank) }"
            @click="selectBank(bank)"
          >
            <div class="flex gap-3 items-center">
              <img
                v-if="getBankIcon(bank.ctType)"
                :src="getBankIcon(bank.ctType)"
                class="rounded h-8 w-8 object-contain"
                :alt="getBankName(bank.ctType)"
              >
              <div
                v-else
                class="i-carbon:wallet text-2xl text-[#FF9933] flex h-8 w-8 items-center justify-center"
              />
              <div>
                <div class="text-sm font-600" :class="{ 'text-[#FF9933]': getBankKey(selectedBank) === getBankKey(bank), 'text-gray-900': getBankKey(selectedBank) !== getBankKey(bank) }">
                  {{ getBankName(bank.ctType) }}
                </div>
                <div class="text-xs text-gray-600">
                  {{ getBankDescription(bank.ctType) }}
                </div>
              </div>
            </div>
            <van-icon
              v-if="getBankKey(selectedBank) === getBankKey(bank)"
              name="success"
              color="#FF9933"
              size="24"
            />
            <div v-else class="border-2 border-gray-300 rounded-full h-6 w-6" />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- OTP Dialog -->
    <van-dialog v-model:show="showOtpDialog" :title="t('upi.link.otpTitle')" show-cancel-button @confirm="handleConfirmOtp">
      <div class="p-3">
        <van-field v-model="otpCode" :placeholder="t('upi.link.otpPlaceholder')" type="number" maxlength="6" input-align="center" />
      </div>
    </van-dialog>
  </div>
</template>

<route lang="json5">
{
  name: 'LinkUpi'
}
</route>
