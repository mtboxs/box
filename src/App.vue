<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouteCacheStore } from '@/stores'

import { getHomeInfo } from '@/api/home'

const { t } = useI18n()
const route = useRoute()

useHead({
  title: () => t('app.name'),
  meta: [
    {
      name: 'description',
      content: () => t('app.description'),
    },
    {
      name: 'theme-color',
      content: () => isDark.value ? '#0B0A0A' : '#ffffff',
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: () => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg',
    },
  ],
})

const routeCacheStore = useRouteCacheStore()

const keepAliveRouteNames = computed(() => {
  return routeCacheStore.routeCaches
})

const showNavBar = computed(() => !route.meta?.hideNavbar)
const showTabBar = computed(() => !route.meta?.hideTabbar)

// 客服链接
const waLink = ref('https://t.me/+sb2cKJyNOoU3YWY1')

onMounted(async () => {
  try {
    const res = await getHomeInfo()
    if (res.code === '200' && res.data?.configs) {
      const link = res.data.configs.find((c: any) => c.paramKey === 'wa_channel_link')?.paramValue
      if (link) {
        waLink.value = link
      }
    }
  }
  catch (e) {
    console.error('Failed to get customer service link', e)
  }
})

function handleCustomerService() {
  window.open(waLink.value, '_blank')
}
</script>

<template>
  <van-config-provider>
    <nav-bar v-if="showNavBar" />
    <router-view v-slot="{ Component }">
      <section class="app-wrapper">
        <keep-alive :include="keepAliveRouteNames">
          <component :is="Component" />
        </keep-alive>
      </section>
    </router-view>
    <tab-bar v-if="showTabBar" />

    <!-- Customer Service Floating Button -->
    <div
      v-if="!['Login', 'Register'].includes(String(route.name))"
      class="transition-all duration-300 right-4 fixed z-50"
      :class="showTabBar ? 'bottom-[70px]' : 'bottom-8'"
    >
      <div
        class="border-2 border-white rounded-full flex h-12 w-12 shadow-lg transition-transform items-center justify-center from-[#FF9933] to-[#FF7700] bg-gradient-to-r active:scale-95"
        @click="handleCustomerService"
      >
        <div class="i-carbon:headset text-2xl text-white" />
      </div>
    </div>
  </van-config-provider>
</template>

<style scoped>
.app-wrapper {
  width: 100%;
  position: relative;
}
</style>
