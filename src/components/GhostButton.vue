<script setup lang="ts">
interface Props {
  to?: any
  block?: boolean
}
const props = defineProps<Props>()
</script>

<template>
  <RouterLink v-if="props.to" :to="props.to">
    <van-button size="small" plain type="primary" :block="props.block" v-bind="$attrs">
      <slot />
    </van-button>
  </RouterLink>
  <van-button v-else size="small" plain type="primary" :block="props.block" v-bind="$attrs">
    <slot />
  </van-button>
</template>

<style scoped>
.van-button {
  --van-button-border-width: 0;
  --van-button-plain-background: opacity;
}
</style>
