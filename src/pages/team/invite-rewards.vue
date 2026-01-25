<script setup lang="ts">
import { showToast } from 'vant'
import type { InviteFriendsReward } from '@/api/team'
import { getInviteFriendsReward } from '@/api/team'

const loading = ref(false)
const reward = ref<InviteFriendsReward | null>(null)
const showFriends = ref(true)

onMounted(async () => {
  await loadReward()
})

async function loadReward() {
  loading.value = true
  try {
    const res = await getInviteFriendsReward()
    if (res.code === '200') {
      reward.value = res.data
    }
  }
  catch (error) {
    showToast({ message: 'Failed to load data', type: 'fail' })
  }
  finally {
    loading.value = false
  }
}

const canReceive = computed(() => {
  if (!reward.value)
    return false
  return reward.value.doneCount > 0
})

function receiveRewards() {
  if (!canReceive.value) {
    showToast({ message: 'Not eligible yet', type: 'fail' })
    return
  }
  showToast({ message: 'Rewards claimed', type: 'success' })
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <NavBar />

    <div class="p-4">
      <van-skeleton :loading="loading" :row="8">
        <div v-if="reward" class="space-y-3">
          <!-- Summary -->
          <div class="text-white p-4 rounded-2xl shadow from-blue-500 to-blue-600 bg-gradient-to-r">
            <div class="text-base font-600 mb-3 text-center">
              Invite Friends Rewards
            </div>
            <div class="gap-3 grid grid-cols-3">
              <div class="text-center">
                <div class="text-xs mb-1 opacity-90">
                  Total bonus
                </div>
                <div class="text-lg font-700">
                  ₹ {{ reward.totalBonus }}
                </div>
              </div>
              <div class="text-center">
                <div class="text-xs mb-1 opacity-90">
                  Done / All Friends
                </div>
                <div class="text-lg font-700">
                  {{ reward.doneCount }}/{{ reward.allFriends }}
                </div>
              </div>
              <div class="text-center">
                <div class="text-xs mb-1 opacity-90">
                  Received bonus
                </div>
                <div class="text-lg font-700">
                  ₹ {{ reward.receivedBonus }}
                </div>
              </div>
            </div>
          </div>

          <div class="text-xs text-red-500 px-2">
            Warning: You need to remind your friends to complete the newbie tasks and receive rewards
          </div>

          <!-- Friends -->
          <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
            <div
              class="p-4 flex cursor-pointer select-none items-center justify-between"
              @click="showFriends = !showFriends"
            >
              <div class="text-sm text-gray-900 font-600">
                Show Your Friends
              </div>
              <div
                class="text-base text-gray-500 transition-transform"
                :class="[showFriends ? 'i-carbon:chevron-up' : 'i-carbon:chevron-down']"
              />
            </div>

            <div v-show="showFriends" class="border-t border-gray-100">
              <div class="divide-gray-100 divide-y">
                <div
                  v-for="(item, idx) in reward.inviteFriends"
                  :key="idx"
                  class="p-4 flex items-center justify-between"
                >
                  <div class="flex gap-3 items-center">
                    <div class="rounded-full flex h-8 w-8 items-center justify-center from-yellow-400 to-yellow-600 bg-gradient-to-br">
                      <div class="i-carbon:gift text-base text-white" />
                    </div>
                    <div>
                      <div class="text-sm text-gray-900 font-600">
                        Invite Friends
                      </div>
                      <div class="text-xs text-gray-500">
                        Target {{ item.targetCnt }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="text-xs font-600 px-3 py-1 rounded-full"
                    :class="[item.done ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600']"
                  >
                    {{ item.done ? 'Done' : 'Status' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Receive -->
          <button
            class="text-sm font-600 py-3 rounded-2xl w-full transition-colors"
            :class="[canReceive ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700' : 'bg-gray-200 text-gray-400']"
            :disabled="!canReceive"
            @click="receiveRewards"
          >
            Receive Rewards
          </button>
        </div>

        <div v-else class="py-16">
          <van-empty description="No rewards available" />
        </div>
      </van-skeleton>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'InviteFriendsRewards'
}
</route>
