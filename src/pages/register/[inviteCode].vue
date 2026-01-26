<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import type { FieldRule } from 'vant'
import { showNotify } from 'vant'
import { useUserStore } from '@/stores'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)

const postData = reactive({
  inviteCode: String((route.params as any).inviteCode || ''),
  phone: '',
  password: '',
  confirmPassword: '',
})

watch(() => (route.params as any).inviteCode, (val) => {
  postData.inviteCode = String(val || '')
})

const validatorPassword = (val: string) => val === postData.password

const rules = reactive({
  inviteCode: [
    { required: true, message: t('register.pleaseEnterInviteCode') },
  ],
  phone: [
    { required: true, message: t('register.pleaseEnterPhone') },
  ],
  password: [
    { required: true, message: t('register.pleaseEnterPassword') },
  ],
  confirmPassword: [
    { required: true, message: t('register.pleaseEnterConfirmPassword') },
    { required: true, validator: validatorPassword, message: t('register.passwordsDoNotMatch') },
  ] as FieldRule[],
})

const showPwd = ref(false)
const showConfirmPwd = ref(false)
function togglePwd() {
  showPwd.value = !showPwd.value
}
function toggleConfirmPwd() {
  showConfirmPwd.value = !showConfirmPwd.value
}

async function register() {
  try {
    loading.value = true
    const res = await userStore.register({
      inviteCode: postData.inviteCode,
      phone: postData.phone,
      nickname: postData.phone, // Use phone as default nickname
      loginPassword: postData.password,
    })
    if (res && res.code === '200') {
      showNotify({ type: 'success', message: t('register.registerSuccess') })
      router.push({ name: 'Login' })
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-[#FFF9F5] flex flex-col min-h-screen">
    <div class="px-6 py-8 flex flex-1 flex-col justify-center">
      <!-- Header -->
      <div class="mb-6 text-center">
        <div class="mx-auto mb-4 rounded-full bg-[#FF9933] flex h-20 w-20 shadow-lg items-center justify-center">
          <div class="i-carbon:user-avatar text-3xl text-white" />
        </div>
        <h1 class="text-2xl text-gray-900 font-700">
          Create Account
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Join us and start earning
        </p>
      </div>

      <van-form :model="postData" :rules="rules" validate-trigger="onSubmit" @submit="register">
        <div class="space-y-3">
          <div class="rounded-xl bg-white shadow-sm overflow-hidden">
            <van-field
              v-model.trim="postData.inviteCode"
              :rules="rules.inviteCode"
              name="inviteCode"
              :placeholder="$t('register.inviteCode')"
              readonly
              disabled
              class="!py-3"
            >
              <template #left-icon>
                <div class="i-carbon:gift text-lg text-[#FF9933] mr-2" />
              </template>
            </van-field>
          </div>

          <div class="rounded-xl bg-white shadow-sm overflow-hidden">
            <van-field
              v-model.trim="postData.phone"
              :rules="rules.phone"
              name="phone"
              :placeholder="$t('register.phone')"
              clearable
              clear-trigger="always"
              class="!py-3"
            >
              <template #left-icon>
                <div class="i-carbon:phone text-lg text-[#FF9933] mr-2" />
              </template>
            </van-field>
          </div>

          <div class="rounded-xl bg-white shadow-sm overflow-hidden">
            <van-field
              v-model.trim="postData.password"
              :type="showPwd ? 'text' : 'password'"
              :rules="rules.password"
              name="password"
              :placeholder="$t('register.password')"
              clearable
              clear-trigger="always"
              class="!py-3"
            >
              <template #left-icon>
                <div class="i-carbon:locked text-lg text-[#FF9933] mr-2" />
              </template>
              <template #right-icon>
                <div
                  :class="showPwd ? 'i-carbon:view' : 'i-carbon:view-off'"
                  class="text-lg text-gray-400"
                  @click="togglePwd"
                />
              </template>
            </van-field>
          </div>

          <div class="rounded-xl bg-white shadow-sm overflow-hidden">
            <van-field
              v-model.trim="postData.confirmPassword"
              :type="showConfirmPwd ? 'text' : 'password'"
              :rules="rules.confirmPassword"
              name="confirmPassword"
              :placeholder="$t('register.confirmPassword')"
              clearable
              clear-trigger="always"
              class="!py-3"
            >
              <template #left-icon>
                <div class="i-carbon:password text-lg text-[#FF9933] mr-2" />
              </template>
              <template #right-icon>
                <div
                  :class="showConfirmPwd ? 'i-carbon:view' : 'i-carbon:view-off'"
                  class="text-lg text-gray-400"
                  @click="toggleConfirmPwd"
                />
              </template>
            </van-field>
          </div>

          <button
            type="submit"
            class="text-base text-white font-600 mt-4 py-4 rounded-xl bg-[#FF9933] w-full shadow-sm active:bg-[#E68A2E] disabled:opacity-50"
            :disabled="loading"
          >
            <span v-if="loading">Creating...</span>
            <span v-else>{{ $t('register.confirm') }}</span>
          </button>
        </div>
      </van-form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          Already have an account?
        </p>
        <router-link :to="{ name: 'Login' }" class="text-base text-[#FF9933] font-600 mt-1 inline-block">
          {{ $t('register.backToLogin') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'RegisterInvite'
}
</route>
