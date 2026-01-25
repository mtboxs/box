<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

import logo from '~/images/logo.svg'
import logoDark from '~/images/logo-dark.svg'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const dark = ref<boolean>(isDark.value)

watch(
  () => isDark.value,
  (newMode) => {
    dark.value = newMode
  },
)

const postData = reactive({
  username: import.meta.env.DEV ? (import.meta.env.VITE_APP_DEFAULT_USERNAME || '') : '',
  password: import.meta.env.DEV ? (import.meta.env.VITE_APP_DEFAULT_PASSWORD || '') : '',
})

const rules = reactive({
  username: [
    { required: true, message: t('login.pleaseEnterUsername') },
  ],
  password: [
    { required: true, message: t('login.pleaseEnterPassword') },
  ],
})

const showPwd = ref(false)
function togglePwd() {
  showPwd.value = !showPwd.value
}

async function login(values: any) {
  try {
    loading.value = true
    await userStore.login({ ...postData, ...values })
    const { redirect, ...othersQuery } = router.currentRoute.value.query
    const toName = (redirect as any) || 'Home'
    router.push({ name: toName as any, query: { ...othersQuery } })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-[#FFF9F5] flex flex-col min-h-screen">
    <div class="px-6 py-8 flex flex-1 flex-col justify-center">
      <!-- Logo & Brand -->
      <div class="mb-8 text-center">
        <div class="mx-auto mb-3 rounded-full bg-white flex h-24 w-24 shadow-lg items-center justify-center">
          <van-image :src="dark ? logoDark : logo" class="h-16 w-16" alt="brand logo" />
        </div>
        <h1 class="text-3xl text-[#FF9933] font-800 mb-2">
          BitCent
        </h1>
        <p class="text-base text-gray-900 font-600">
          Welcome Back
        </p>
        <p class="text-sm text-gray-500 mt-1">
          Sign in to continue
        </p>
      </div>

      <van-form :model="postData" :rules="rules" validate-trigger="onSubmit" @submit="login">
        <div class="space-y-4">
          <div class="rounded-xl bg-white shadow-sm overflow-hidden">
            <van-field
              v-model="postData.username"
              :rules="rules.username"
              name="username"
              :placeholder="$t('login.username')"
              clearable
              clear-trigger="always"
              class="!py-3"
            />
          </div>

          <div class="rounded-xl bg-white shadow-sm overflow-hidden">
            <van-field
              v-model="postData.password"
              :type="showPwd ? 'text' : 'password'"
              :rules="rules.password"
              name="password"
              :placeholder="$t('login.password')"
              clearable
              clear-trigger="always"
              class="!py-3"
            >
              <template #right-icon>
                <div
                  :class="showPwd ? 'i-carbon:view' : 'i-carbon:view-off'"
                  class="text-lg text-gray-400"
                  @click="togglePwd"
                />
              </template>
            </van-field>
          </div>

          <button
            type="submit"
            class="text-base text-white font-600 mt-6 py-4 rounded-xl bg-[#FF9933] w-full shadow-sm active:bg-[#E68A2E] disabled:opacity-50"
            :disabled="loading"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>{{ $t('login.login') }}</span>
          </button>
        </div>
      </van-form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          Don't have an account?
        </p>
        <router-link :to="{ name: 'Register' }" class="text-base text-[#FF9933] font-600 mt-1 inline-block">
          {{ $t('login.signUp') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'Login'
}
</route>
