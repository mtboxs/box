<script setup lang="ts">
import { rootRouteList } from '@/config/routes'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const active = ref(0)
const route = useRoute()

const show = computed(() => {
  if (route.name && rootRouteList.includes(route.name)) {
    return true
  }
  return false
})

const icons = {
  home: {
    active: new URL('@/assets/images/icon-home-active.png', import.meta.url).href,
    inactive: new URL('@/assets/images/icon-home.png', import.meta.url).href,
  },
  buy: {
    active: new URL('@/assets/images/icon-service-active.png', import.meta.url).href,
    inactive: new URL('@/assets/images/icon-service.png', import.meta.url).href,
  },
  activity: {
    active: new URL('@/assets/images/icon-activity-active.png', import.meta.url).href,
    inactive: new URL('@/assets/images/icon-activity.png', import.meta.url).href,
  },
  profile: {
    active: new URL('@/assets/images/icon-me-active.png', import.meta.url).href,
    inactive: new URL('@/assets/images/icon-me.png', import.meta.url).href,
  },
}
</script>

<template>
  <van-tabbar
    v-if="show"
    v-model="active"
    route
    placeholder
    active-color="#e11d48"
    inactive-color="#9CA3AF"
    class="tabbar-dark"
  >
    <!-- Home -->
    <van-tabbar-item replace to="/">
      <span class="text-xs">{{ t('tabbar.home') }}</span>
      <template #icon="{ active }">
        <img :src="active ? icons.home.active : icons.home.inactive" class="w-6 h-6 object-contain" />
      </template>
    </van-tabbar-item>

    <!-- Buy / More Products -->
    <van-tabbar-item replace to="/buy">
      <span class="text-xs">{{ t('tabbar.buy') }}</span>
      <template #icon="{ active }">
        <img :src="active ? icons.buy.active : icons.buy.inactive" class="w-6 h-6 object-contain" />
      </template>
    </van-tabbar-item>

    <!-- Activity -->
    <van-tabbar-item replace to="/activity">
      <span class="text-xs">{{ t('tabbar.activity') }}</span>
      <template #icon="{ active }">
        <img :src="active ? icons.activity.active : icons.activity.inactive" class="w-6 h-6 object-contain" />
      </template>
    </van-tabbar-item>

    <!-- Profile / Me -->
    <van-tabbar-item replace to="/profile">
      <span class="text-xs">{{ t('tabbar.profile') }}</span>
      <template #icon="{ active }">
        <img :src="active ? icons.profile.active : icons.profile.inactive" class="w-6 h-6 object-contain" />
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>

<style scoped>
.tabbar-dark {
  --van-tabbar-background: #000000;
  --van-tabbar-item-text-color: #ffffff;
  --van-tabbar-item-active-background: #000000;
  border-top: 1px solid #333;
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 100 !important;
}

.tabbar-dark :deep(.van-tabbar-item) {
  background: #000;
}
</style>
