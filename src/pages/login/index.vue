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
  password: '',
})

// Rules need to be reactive or computed if we want them to change with language switch,
// but for now simple object is fine, or use computed for messages if dynamic switch is needed without reload.
// Assuming dynamic switch:
const rules = {
  phone: [{ required: true, message: () => t('login.enterPhone') }],
  password: [{ required: true, message: () => t('login.enterPassword') }],
}

async function handleLogin() {
  if (!postData.phone || !postData.password) return
  
  try {
    loading.value = true
    await userStore.login(postData)
    // On success
    router.push({ name: 'Home' })
  } catch (error) {
    showToast(t('login.loginFailed'))
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
           <img src="@/assets/images/logo.jpg" class="w-full h-full object-cover" />
        </div>
      </div>

      <!-- Login Form Area -->
      <div class="px-8">
        <h2 class="text-2xl font-bold text-black mb-6">{{ t('login.title') }}</h2>

        <van-form @submit="handleLogin">
          <!-- Phone -->
          <div class="mb-4">
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('login.phone') }}</label>
            <van-field
              v-model="postData.phone"
              name="phone"
              :placeholder="t('login.enterPhone')"
              :rules="rules.phone"
              class="!bg-[#F5F5F5] !rounded-lg !py-3 !px-4"
              :border="false"
            />
          </div>

          <!-- Password -->
          <div class="mb-8">
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('login.password') }}</label>
            <van-field
              v-model="postData.password"
              type="password"
              name="password"
              :placeholder="t('login.enterPassword')"
              :rules="rules.password"
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
            <span v-if="loading">{{ t('login.loading') }}</span>
            <span v-else>{{ t('login.loginBtn') }}</span>
          </button>
        </van-form>

        <!-- Footer Link -->
        <div class="text-center mt-6 text-sm">
          <span class="text-gray-400">{{ t('login.noAccount') }} </span>
          <router-link :to="{ name: 'Register' }" class="text-red-500 font-bold hover:underline">
            {{ t('login.signup') }}
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
  name: 'Login',
  meta: {
    layout: 'blank'
  }
}
</route>
