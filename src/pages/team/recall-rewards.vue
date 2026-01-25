<script setup lang="ts">
import { showToast } from 'vant'
import type { RecallFriendsReward } from '@/api/team'
import { getRecallFriendsReward } from '@/api/team'

const router = useRouter()
const loading = ref(false)
const rewardData = ref<RecallFriendsReward | null>(null)

onMounted(async () => {
  // 使用 nextTick 延迟数据加载，让页面先渲染
  await nextTick()
  await loadRewardData()
})

async function loadRewardData() {
  try {
    loading.value = true
    const res = await getRecallFriendsReward()
    if (res.code === '200') {
      rewardData.value = res.data
    }
  }
  catch (error) {
    showToast({ message: 'Failed to load reward data', type: 'fail' })
  }
  finally {
    loading.value = false
  }
}

function handleReceiveRewards() {
  // TODO: 领取奖励逻辑
  showToast({ message: 'Reward claimed successfully', type: 'success' })
}

function getProgressPercentage(alreadyBuy: number, needBuy: number) {
  if (needBuy === 0)
    return 100
  return Math.min((alreadyBuy / needBuy) * 100, 100)
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <NavBar title="Recall Friends Reward">
      <template #left>
        <div class="i-carbon:chevron-left text-xl cursor-pointer" @click="router.back()" />
      </template>
    </NavBar>

    <van-skeleton :loading="loading" :row="8">
      <div v-if="rewardData" class="p-4 space-y-4">
        <!-- Summary Card -->
        <div class="p-4 rounded-xl shadow-lg from-green-500 to-green-600 bg-gradient-to-r">
          <div class="text-white gap-4 grid grid-cols-3">
            <div class="text-center">
              <div class="mb-1 flex gap-1 items-center justify-center">
                <div class="i-carbon:currency text-lg" />
                <span class="text-xs">{{ rewardData.bonus }}</span>
              </div>
              <div class="text-xs opacity-90">
                Available Bonus
              </div>
            </div>

            <div class="text-center">
              <div class="text-base font-600 mb-1">
                {{ rewardData.canCalledFriends }}
              </div>
              <div class="text-xs opacity-90">
                Can Recall
              </div>
            </div>

            <div class="text-center">
              <div class="mb-1 flex gap-1 items-center justify-center">
                <div class="i-carbon:currency text-lg" />
                <span class="text-xs">{{ rewardData.receivedBonus }}</span>
              </div>
              <div class="text-xs opacity-90">
                Received
              </div>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="p-3 border border-blue-100 rounded-lg bg-blue-50">
          <p class="text-sm text-blue-600">
            Recall inactive friends and earn rewards when they complete purchases!
          </p>
        </div>

        <!-- Friends List -->
        <div v-if="rewardData.recallFriends && rewardData.recallFriends.length > 0" class="space-y-3">
          <h3 class="text-base text-gray-900 font-600">
            Recall Friends
          </h3>

          <div
            v-for="(friend, index) in rewardData.recallFriends"
            :key="index"
            class="p-4 rounded-lg bg-white shadow-sm space-y-3"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-900 font-600">{{ friend.username }}</span>
              <span class="text-xs text-gray-500">
                {{ friend.alreadyBuy }} / {{ friend.needBuy }}
              </span>
            </div>

            <div class="space-y-1">
              <div class="rounded-full bg-gray-200 h-2 w-full overflow-hidden">
                <div
                  class="bg-green-500 h-full transition-all duration-300"
                  :style="{ width: `${getProgressPercentage(friend.alreadyBuy, friend.needBuy)}%` }"
                />
              </div>
              <div class="text-xs text-gray-500 flex items-center justify-between">
                <span>Already: ₹{{ friend.alreadyBuy }}</span>
                <span>Need: ₹{{ friend.needBuy }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-12">
          <van-empty description="No friends to recall" />
        </div>

        <!-- Receive Button -->
        <button
          class="text-base text-white font-600 py-3 rounded-lg w-full shadow-lg transition-all from-green-500 to-green-600 bg-gradient-to-r disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-green-700"
          :disabled="rewardData.bonus === 0"
          @click="handleReceiveRewards"
        >
          Receive Rewards (₹{{ rewardData.bonus }})
        </button>
      </div>
    </van-skeleton>
  </div>
</template>

<route lang="json5">
{
  name: 'RecallRewards'
}
</route>
