<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { saveBankInfo } from '@/api/mine'
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/modules/user'
import MD5 from 'crypto-js/md5'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// Check if already bound
const isBound = computed(() => {
  return !!(userInfo.value.bankCardNo && userInfo.value.bankName)
})

// Edit mode
const isEditing = ref(false)
const showPassword = ref(false)

const form = ref({
  actualName: '',
  bankName: '',
  bankCardNo: '',
  withdrawPassword: ''
})

// Initialize form with existing data
onMounted(() => {
  if (isBound.value) {
    form.value.actualName = userInfo.value.actualName || ''
    form.value.bankName = userInfo.value.bankName || ''
    form.value.bankCardNo = userInfo.value.bankCardNo || ''
  }
})

const maskBankCard = (cardNo: string) => {
  if (!cardNo || cardNo.length < 8) return cardNo || '---'
  return cardNo.slice(0, 4) + ' **** **** ' + cardNo.slice(-4)
}

const enableEdit = () => {
  isEditing.value = true
  // Clear password for security
  form.value.withdrawPassword = ''
}

const cancelEdit = () => {
  isEditing.value = false
  // Restore original values
  form.value.actualName = userInfo.value.actualName || ''
  form.value.bankName = userInfo.value.bankName || ''
  form.value.bankCardNo = userInfo.value.bankCardNo || ''
  form.value.withdrawPassword = ''
}

const onSubmit = async () => {
  if (!form.value.actualName || !form.value.bankCardNo || !form.value.bankName || !form.value.withdrawPassword) {
    showToast(t('bankCard.fillAll'))
    return
  }

  // Confirm before submit
  try {
    await showDialog({
      title: t('profile.tips'),
      message: isBound.value ? t('bankCard.confirmUpdate') : t('bankCard.confirmSave'),
      confirmButtonText: t('profile.confirm'),
      cancelButtonText: t('profile.cancel'),
      showCancelButton: true,
    })
  } catch {
    return
  }

  showLoadingToast({ message: t('login.loading'), forbidClick: true })
  try {
    const res = await saveBankInfo({
      ...form.value,
      withdrawPassword: MD5(form.value.withdrawPassword).toString()
    })
    closeToast()
    if (res.code === '200') {
      showToast({ type: 'success', message: t('bankCard.saveSuccess') })
      // Refresh user info
      await userStore.info()
      isEditing.value = false
      form.value.withdrawPassword = ''
    } else {
      showToast({ type: 'fail', message: res.msg || t('record.failed') })
    }
  } catch (error) {
    closeToast()
    showToast({ type: 'fail', message: t('activity.networkError') })
  }
}

const goBack = () => router.back()
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white text-black px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
      <button @click="goBack" class="p-1">
        <div class="i-carbon:arrow-left text-xl"></div>
      </button>
      <h1 class="text-base font-bold flex-1 text-center mr-6">{{ t('bankCard.title') }}</h1>
    </div>

    <!-- Already Bound - Display Mode -->
    <div v-if="isBound && !isEditing" class="p-4 mt-2">
      <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-xl">
        <!-- Bank Card Design -->
        <div class="flex justify-between items-start mb-8">
          <div>
            <div class="text-xs text-gray-400 mb-1">{{ t('bankCard.bankName') }}</div>
            <div class="text-lg font-bold">{{ userInfo.bankName }}</div>
          </div>
          <div class="i-carbon:bank text-3xl text-gray-400"></div>
        </div>

        <div class="mb-6">
          <div class="text-xs text-gray-400 mb-1">{{ t('bankCard.cardNo') }}</div>
          <div class="text-2xl font-mono tracking-wider">{{ maskBankCard(userInfo.bankCardNo) }}</div>
        </div>

        <div class="flex justify-between items-end">
          <div>
            <div class="text-xs text-gray-400 mb-1">{{ t('bankCard.realName') }}</div>
            <div class="text-base font-medium">{{ userInfo.actualName }}</div>
          </div>
          <div class="text-xs text-gray-500">{{ t('bankCard.bound') }}</div>
        </div>
      </div>

      <!-- Edit Button -->
      <div class="mt-6">
        <button
          @click="enableEdit"
          class="w-full bg-black text-white rounded-lg py-3 text-sm font-bold shadow-lg active:scale-95 transition-transform"
        >
          {{ t('bankCard.editBtn') }}
        </button>
      </div>
    </div>

    <!-- Form - Not Bound or Editing -->
    <div v-else class="p-4 mt-2">
      <div class="bg-white rounded-xl overflow-hidden shadow-sm p-4 space-y-4">
         <div class="space-y-1">
            <label class="text-xs text-gray-500">{{ t('bankCard.realName') }}</label>
            <input
              v-model="form.actualName"
              type="text"
              class="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm"
              :placeholder="t('bankCard.enterRealName')"
            />
         </div>

         <div class="space-y-1">
            <label class="text-xs text-gray-500">{{ t('bankCard.bankName') }}</label>
            <input
              v-model="form.bankName"
              type="text"
              class="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm"
              :placeholder="t('bankCard.enterBankName')"
            />
         </div>

         <div class="space-y-1">
            <label class="text-xs text-gray-500">{{ t('bankCard.cardNo') }}</label>
            <input
              v-model="form.bankCardNo"
              type="text"
              class="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm"
              :placeholder="t('bankCard.enterCardNo')"
            />
         </div>

         <div class="space-y-1">
            <label class="text-xs text-gray-500">{{ t('bankCard.withdrawPwd') }}</label>
            <div class="relative">
              <input
                v-model="form.withdrawPassword"
                :type="showPassword ? 'text' : 'password'"
                class="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm pr-10"
                :placeholder="t('bankCard.enterWithdrawPwd')"
              />
              <div 
                class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                @click="showPassword = !showPassword"
              >
                <div :class="showPassword ? 'i-carbon:view' : 'i-carbon:view-off'" class="text-lg"></div>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ t('bankCard.withdrawPwdHint') }}</p>
         </div>

         <div class="pt-4 space-y-3">
            <button
              @click="onSubmit"
              class="w-full bg-black text-white rounded-lg py-3 text-sm font-bold shadow-lg active:scale-95 transition-transform"
            >
              {{ isBound ? t('bankCard.updateBtn') : t('bankCard.saveBtn') }}
            </button>

            <button
              v-if="isEditing"
              @click="cancelEdit"
              class="w-full bg-gray-200 text-gray-700 rounded-lg py-3 text-sm font-bold active:scale-95 transition-transform"
            >
              {{ t('profile.cancel') }}
            </button>
         </div>
      </div>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'BankCard',
  meta: {
    hideTabbar: true,
  }
}
</route>
