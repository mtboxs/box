<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant'
import router from '@/router'
import { useUserStore } from '@/stores'
import { version } from '~root/package.json'
import { updatePassword, updateSellLimit } from '@/api/mine'
import type { PickerColumn } from 'vant'
import { languageColumns, locale } from '@/utils/i18n'

const { t } = useI18n()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const showPwdDialog = ref(false)
const newPassword = ref('')
const otpCode = ref('')

const showSellLimitDialog = ref(false)
const sellLimitAmount = ref<number | string>('')

const checked = computed({
  get: () => isDark.value,
  set: () => toggleDark(),
})
const showLanguagePicker = ref(false)
const languageValues = ref<Array<string>>([locale.value])
const language = computed(() => languageColumns.find(l => l.value === locale.value).text)
function onLanguageConfirm(event: { selectedOptions: PickerColumn }) {
  locale.value = event.selectedOptions[0].value as string
  showLanguagePicker.value = false
}

function cleanLabel(s: string) {
  return String(s).replace(/^[^A-Z\u4E00-\u9FA5]+/i, '')
}

function Logout() {
  showConfirmDialog({
    title: t('settings.confirmTitle'),
  })
    .then(() => {
      userStore.logout()
      router.push({ name: 'Home' })
    })
    .catch(() => {})
}

async function onConfirmUpdatePassword() {
  const pwd = String(newPassword.value || '').trim()
  const otp = String(otpCode.value || '').trim()
  if (!pwd) {
    showToast({ message: t('settings.enterNewPassword'), type: 'fail' })
    return
  }
  if (!/^\d{6}$/.test(otp)) {
    showToast({ message: t('settings.enterOtp'), type: 'fail' })
    return
  }
  try {
    const res = await updatePassword({ newPassword: pwd, otp })
    if (res.code === '200') {
      showToast({ message: t('settings.updateSuccess'), type: 'success' })
    }
    else {
      showToast({ message: t('settings.updateFailed'), type: 'fail' })
    }
  }
  catch {
    showToast({ message: t('settings.updateFailed'), type: 'fail' })
  }
  finally {
    showPwdDialog.value = false
    newPassword.value = ''
    otpCode.value = ''
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
</script>

<template>
  <div class="bg-[#FFF9F5] min-h-screen">
    <!-- General Settings -->
    <div class="mx-3 mt-3">
      <div class="text-sm text-gray-700 font-600 mb-2 px-1">
        General
      </div>
      <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#FFF3E6] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:moon text-xl text-[#FF9933]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ cleanLabel($t('home.darkMode')) }}</span>
          </div>
          <van-switch v-model="checked" size="22px" />
        </div>
        <div class="px-4 py-3 flex items-center justify-between active:bg-orange-50" @click="showLanguagePicker = true">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#EBF5FF] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:earth text-xl text-[#3B82F6]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ cleanLabel($t('home.language')) }}</span>
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-sm text-gray-500">{{ language }}</span>
            <div class="i-carbon:chevron-right text-gray-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Account Settings -->
    <div class="mx-3 mt-3">
      <div class="text-sm text-gray-700 font-600 mb-2 px-1">
        Account
      </div>
      <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between active:bg-orange-50" @click="showPwdDialog = true">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#F0FDF0] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:password text-xl text-[#138808]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ $t('settings.updatePassword') }}</span>
          </div>
          <div class="i-carbon:chevron-right text-gray-400" />
        </div>
        <div class="px-4 py-3 flex items-center justify-between active:bg-orange-50" @click="showSellLimitDialog = true">
          <div class="flex gap-3 items-center">
            <div class="rounded-full bg-[#FEF3C7] flex h-10 w-10 items-center justify-center">
              <div class="i-carbon:currency-rupee text-xl text-[#F59E0B]" />
            </div>
            <span class="text-sm text-gray-800 font-500">{{ $t('settings.updateSellLimit') }}</span>
          </div>
          <div class="i-carbon:chevron-right text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Version -->
    <div class="text-sm text-gray-400 mt-4 text-center">
      {{ $t("settings.currentVersion") }}: v{{ version }}
    </div>

    <!-- Logout -->
    <div v-if="userInfo.uid" class="mx-3 mt-4">
      <button class="text-sm text-red-500 font-600 py-3 rounded-2xl bg-white w-full shadow-sm active:bg-red-50" @click="Logout">
        {{ $t('settings.logout') }}
      </button>
    </div>

    <van-dialog v-model:show="showPwdDialog" :title="$t('settings.updatePassword')" show-cancel-button @confirm="onConfirmUpdatePassword">
      <div class="p-4 space-y-3">
        <div class="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <van-field v-model="newPassword" :placeholder="$t('settings.enterNewPassword')" type="password" />
        </div>
        <div class="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <van-field v-model="otpCode" :placeholder="$t('settings.enterOtp')" type="number" maxlength="6" />
        </div>
      </div>
    </van-dialog>

    <van-dialog v-model:show="showSellLimitDialog" :title="$t('settings.updateSellLimit')" show-cancel-button @confirm="onConfirmUpdateSellLimit">
      <div class="p-4">
        <div class="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <van-field v-model="sellLimitAmount" :placeholder="$t('settings.enterAmount')" type="number" />
        </div>
      </div>
    </van-dialog>

    <van-popup v-model:show="showLanguagePicker" position="bottom" round>
      <van-picker
        v-model="languageValues"
        :columns="languageColumns"
        @confirm="onLanguageConfirm"
        @cancel="showLanguagePicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.van-text-color {
  --van-cell-text-color: var(--van-red);
}
</style>

<route lang="json5">
{
  name: 'Settings'
}
</route>
