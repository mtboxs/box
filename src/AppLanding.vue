<script setup lang="ts">
const mode = computed(() => {
  return isDark.value ? 'dark' : 'light'
})
</script>

<template>
  <van-config-provider :theme="mode">
    <router-view />
  </van-config-provider>
</template>
