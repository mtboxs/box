<script setup lang="ts">
import { rootRouteList } from '@/config/routes'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

/**
 * Get page title
 * Located in src/locales/json
 */
const title = computed(() => {
  if (!route.name)
    return ''
  const key = `navbar.${route.name}`
  const translated = t(key)
  // 如果翻译不存在（返回 key 本身），返回空字符串
  return translated === key ? '' : translated
})

/**
 * Show the left arrow
 * If route name is in rootRouteList, hide left arrow
 */
const showLeftArrow = computed(() => {
  if (route.name && rootRouteList.includes(route.name)) {
    return false
  }

  return true
})

function onBack() {
  if (window.history.state.back) {
    history.back()
  }
  else {
    router.replace('/')
  }
}

const showSettings = computed(() => route.name === 'Profile')
const showHistory = computed(() => false) // Disabled history icon in navbar for Buy page as per request

function goSettings() {
  router.push('/settings')
}

function goHistory() {
  router.push('/buy/history')
}
</script>

<template>
  <VanNavBar
    :title="title"
    :fixed="true"
    placeholder
    :left-arrow="showLeftArrow"
    clickable
    class="navbar-indian"
    @click-left="onBack"
  >
    <template #right>
      <button v-if="showSettings" class="rounded-full bg-[#FFF3E6] flex h-8 w-8 items-center justify-center active:bg-orange-100" @click="goSettings">
        <div class="i-carbon:settings text-lg text-[#FF9933]" />
      </button>
      <button v-if="showHistory" class="rounded-full bg-[#FFF3E6] flex h-8 w-8 items-center justify-center active:bg-orange-100" @click="goHistory">
        <div class="i-carbon:time text-lg text-[#FF9933]" />
      </button>
    </template>
  </VanNavBar>
</template>

<style scoped>
.navbar-indian {
  --van-nav-bar-background: #ffffff;
  --van-nav-bar-title-text-color: #1f2937;
  --van-nav-bar-icon-color: #ff9933;
  --van-nav-bar-arrow-size: 20px;
  border-bottom: 1px solid #ffe4cc;
}

.navbar-indian :deep(.van-nav-bar__title) {
  font-weight: 600;
  font-size: 16px;
}
</style>
