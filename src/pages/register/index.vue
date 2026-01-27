<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const postData = reactive({
  phone: '',
  nickname: '',
  loginPassword: '', // Mapped to 'password' in UI
  confirmPassword: '',
  inviteCode: '',
})

const rules = {
  phone: [{ required: true, message: () => t('register.enterPhone') }],
  nickname: [{ required: true, message: () => t('register.enterNickname') }],
  loginPassword: [{ required: true, message: () => t('register.enterPassword') }],
  confirmPassword: [
    { required: true, message: () => t('register.enterConfirmPassword') },
    {
      validator: (val: string) => val === postData.loginPassword,
      message: () => t('register.passwordMismatch'),
    },
  ],
  inviteCode: [{ required: true, message: () => t('register.enterInviteCode') }],
}

async function handleRegister() {
  if (
    !postData.phone ||
    !postData.nickname ||
    !postData.loginPassword ||
    !postData.confirmPassword ||
    !postData.inviteCode
  ) {
    return
  }
  
  try {
    loading.value = true
    const res = await userStore.register(postData)
    if (res && res.code === '200') {
       showToast(t('register.success'))
       router.push({ name: 'Login' })
    } else {
       showToast(res?.msg || t('register.failed'))
    }
  } catch (error) {
    showToast(t('register.failed'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0E444F] flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden relative pb-10">
      
      <!-- Top Mascot & Logo -->
      <div class="pt-8 pb-4 text-center">
        <!-- Mascot Circle -->
        <div class="w-24 h-24 mx-auto rounded-full bg-[#A8E6F0] flex items-center justify-center overflow-hidden mb-3 border-4 border-white shadow-sm relative z-10">
           <img src="/logo.jpg" class="w-full h-full object-cover" />
        </div>
        
        <!-- Brand Text -->
        <h1 class="text-3xl font-bold tracking-tight">
          <span class="text-[#1E1E50]">Presta</span><span class="text-[#E91E63]">Shop</span>
        </h1>
      </div>

      <!-- Register Form Area -->
      <div class="px-8">
        <h2 class="text-2xl font-bold text-black mb-6">{{ t('register.title') }}</h2>

        <van-form @submit="handleRegister">
          
          <!-- Phone -->
          <div class="mb-4">
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('register.phone') }}</label>
            <van-field
              v-model="postData.phone"
              name="phone"
              :placeholder="t('register.enterPhone')"
              :rules="rules.phone"
              class="!bg-[#F5F5F5] !rounded-lg !py-3 !px-4"
              :border="false"
            />
          </div>

          <!-- Nickname -->
          <div class="mb-4">
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('register.nickname') }}</label>
            <van-field
              v-model="postData.nickname"
              name="nickname"
              :placeholder="t('register.enterNickname')"
              :rules="rules.nickname"
              class="!bg-[#F5F5F5] !rounded-lg !py-3 !px-4"
              :border="false"
            />
          </div>

          <!-- Password -->
          <div class="mb-4">
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('register.password') }}</label>
            <van-field
              v-model="postData.loginPassword"
              type="password"
              name="loginPassword"
              :placeholder="t('register.enterPassword')"
              :rules="rules.loginPassword"
              class="!bg-[#F5F5F5] !rounded-lg !py-3 !px-4"
              :border="false"
            />
          </div>

          <!-- Confirm Password -->
          <div class="mb-4">
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('register.confirmPassword') }}</label>
            <van-field
              v-model="postData.confirmPassword"
              type="password"
              name="confirmPassword"
              :placeholder="t('register.enterConfirmPassword')"
              :rules="rules.confirmPassword"
              class="!bg-[#F5F5F5] !rounded-lg !py-3 !px-4"
              :border="false"
            />
          </div>

          <!-- Invitation Code -->
          <div class="mb-8">
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('register.inviteCode') }}</label>
            <van-field
              v-model="postData.inviteCode"
              name="inviteCode"
              :placeholder="t('register.enterInviteCode')"
              :rules="rules.inviteCode"
              class="!bg-[#F5F5F5] !rounded-lg !py-3 !px-4"
              :border="false"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full bg-black text-white font-bold py-3.5 rounded-full shadow-lg active:scale-95 transition-transform"
            :disabled="loading"
          >
            <span v-if="loading">{{ t('register.creating') }}</span>
            <span v-else>{{ t('register.registerBtn') }}</span>
          </button>
        </van-form>

        <!-- Footer Link -->
        <div class="text-center mt-6 text-sm">
          <span class="text-gray-400">{{ t('register.hasAccount') }} </span>
          <router-link :to="{ name: 'Login' }" class="text-red-500 font-bold hover:underline">
            {{ t('register.login') }}
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
:deep(.van-field__control) {
  color: #333;
}
:deep(.van-cell) {
  padding: 0;
  background: transparent;
}
</style>

<route lang="json5">
{
  name: 'Register',
  meta: {
    layout: 'blank'
  }
}
</route>
