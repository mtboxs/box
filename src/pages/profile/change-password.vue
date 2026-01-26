<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { modifyLoginPassword, modifyWithdrawPassword } from '@/api/mine'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const activeTab = ref(0) // 0: Login Pwd, 1: Withdraw Pwd

// Handle query param to switch tab (e.g., ?tab=withdraw)
onMounted(() => {
  if (route.query.tab === 'withdraw') {
    activeTab.value = 1
  }
})

const loginForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const withdrawForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const onSubmit = async () => {
  const isLogin = activeTab.value === 0
  const form = isLogin ? loginForm.value : withdrawForm.value
  
  if (!form.newPassword || !form.confirmPassword) {
    showToast(t('changePwd.fillAll'))
    return
  }

  if (form.newPassword !== form.confirmPassword) {
    showToast(t('changePwd.mismatch'))
    return
  }

  showLoadingToast({ message: t('login.loading'), forbidClick: true })
  
  try {
    const apiFunc = isLogin ? modifyLoginPassword : modifyWithdrawPassword
    const res = await apiFunc({
      newPassword: form.newPassword,
      oldPassword: form.oldPassword // Optional depending on API requirement, usually required
    })

    if (res.code === '200') {
      closeToast()
      showToast({ type: 'success', message: t('changePwd.success') })
      if (isLogin) {
         // Maybe logout?
      }
      router.back()
    } else {
      closeToast()
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
      <h1 class="text-base font-bold flex-1 text-center mr-6">{{ t('changePwd.title') }}</h1>
    </div>

    <div class="p-4">
       <van-tabs v-model:active="activeTab" type="card" class="mb-6">
          <van-tab :title="t('changePwd.loginPwd')" />
          <van-tab :title="t('changePwd.withdrawPwd')" />
       </van-tabs>

       <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <template v-if="activeTab === 0">
             <div class="space-y-1">
                <label class="text-xs text-gray-500">{{ t('changePwd.oldPwd') }}</label>
                <input v-model="loginForm.oldPassword" type="password" class="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm" :placeholder="t('changePwd.optional')" />
             </div>
             <div class="space-y-1">
                <label class="text-xs text-gray-500">{{ t('changePwd.newPwd') }}</label>
                <input v-model="loginForm.newPassword" type="password" class="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm" :placeholder="t('changePwd.enterNew')" />
             </div>
             <div class="space-y-1">
                <label class="text-xs text-gray-500">{{ t('changePwd.confirmPwd') }}</label>
                <input v-model="loginForm.confirmPassword" type="password" class="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm" :placeholder="t('changePwd.confirmNew')" />
             </div>
          </template>

          <template v-else>
             <div class="space-y-1">
                <label class="text-xs text-gray-500">{{ t('changePwd.oldPwd') }}</label>
                <input v-model="withdrawForm.oldPassword" type="password" class="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm" :placeholder="t('changePwd.optional')" />
             </div>
             <div class="space-y-1">
                <label class="text-xs text-gray-500">{{ t('changePwd.newPwd') }}</label>
                <input v-model="withdrawForm.newPassword" type="password" class="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm" :placeholder="t('changePwd.enterNew')" />
             </div>
             <div class="space-y-1">
                <label class="text-xs text-gray-500">{{ t('changePwd.confirmPwd') }}</label>
                <input v-model="withdrawForm.confirmPassword" type="password" class="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm" :placeholder="t('changePwd.confirmNew')" />
             </div>
          </template>

          <div class="pt-4">
            <button 
              @click="onSubmit"
              class="w-full bg-black text-white rounded-lg py-3 text-sm font-bold shadow-lg active:scale-95 transition-transform"
            >
              {{ t('changePwd.updateBtn') }}
            </button>
         </div>
       </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.van-tabs__nav--card) {
  border: none;
}
:deep(.van-tab--card) {
  border: none;
  background-color: #f3f4f6;
  margin: 0 4px;
  border-radius: 8px;
  color: #6b7280;
}
:deep(.van-tab--card.van-tab--active) {
  background-color: #000;
  color: #fff;
}
</style>
