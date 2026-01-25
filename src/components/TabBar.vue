<script setup lang="ts">
import { rootRouteList } from '@/config/routes'

const active = ref(0)
const route = useRoute()

const show = computed(() => {
  if (route.name && rootRouteList.includes(route.name)) {
    return true
  }
  return false
})
</script>

<template>
  <van-tabbar
    v-if="show"
    v-model="active"
    route
    placeholder
    active-color="#FF9933"
    inactive-color="#9CA3AF"
    class="tabbar-indian"
  >
    <van-tabbar-item replace to="/">
      {{ $t('tabbar.home') }}
      <template #icon>
        <div class="i-carbon:home text-xl" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/buy">
      {{ $t('tabbar.buy') }}
      <template #icon>
        <div class="i-carbon:money text-xl" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/upi">
      {{ $t('tabbar.upi') }}
      <template #icon>
        <div class="i-carbon:wallet text-xl" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/sell">
      {{ $t('tabbar.sell') }}
      <template #icon>
        <div class="i-carbon:document-export text-xl" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/profile">
      {{ $t('tabbar.mine') }}
      <template #icon>
        <div class="i-carbon:user-avatar text-xl" />
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>

<style scoped>
.tabbar-indian {
  --van-tabbar-background: #ffffff;
  border-top: 1px solid #ffe4cc;
  box-shadow: 0 -2px 10px rgba(255, 153, 51, 0.1);
}

.tabbar-indian :deep(.van-tabbar-item) {
  font-size: 11px;
  font-weight: 500;
}

.tabbar-indian :deep(.van-tabbar-item--active) {
  font-weight: 600;
}
</style>
