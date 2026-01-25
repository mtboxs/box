<script setup lang="ts">
import { showToast } from 'vant'
import { getInviteFriendsReward, getL1Report, getL2Report, getL3Report, getTeamHome } from '@/api/team'
import type { InviteFriendsReward, MbrTeamDaily, PageResponse, TeamHomeData } from '@/api/team'

const loading = ref(false)
const refreshing = ref(false)
const memberList = ref<MbrTeamDaily[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const finished = ref(false)
const currentLevel = ref(1) // 当前选中的等级

const inviteReward = ref<InviteFriendsReward | null>(null)
const teamHomeData = ref<TeamHomeData | null>(null)

async function loadInviteReward() {
  try {
    const res = await getInviteFriendsReward()
    if (res.code === '200') {
      inviteReward.value = res.data
    }
  }
  catch (e) {
    console.error(e)
  }
}

async function loadTeamHome() {
  try {
    const res = await getTeamHome()
    if (res.code === '200') {
      teamHomeData.value = res.data
    }
  }
  catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  memberList.value = []
  page.value = 1
  finished.value = false
  await Promise.all([loadMembers(), loadInviteReward(), loadTeamHome()])
})

onActivated(async () => {
  memberList.value = []
  page.value = 1
  finished.value = false
  await Promise.all([loadMembers(), loadInviteReward(), loadTeamHome()])
})

async function onRefresh() {
  refreshing.value = true
  memberList.value = []
  page.value = 1
  finished.value = false
  await Promise.all([loadMembers(), loadInviteReward(), loadTeamHome()])
  refreshing.value = false
}

async function loadMembers() {
  if (loading.value)
    return

  try {
    loading.value = true
    let res
    if (currentLevel.value === 1) {
      res = await getL1Report({ page: page.value, pageSize: pageSize.value })
    }
    else if (currentLevel.value === 2) {
      res = await getL2Report({ page: page.value, pageSize: pageSize.value })
    }
    else {
      res = await getL3Report({ page: page.value, pageSize: pageSize.value })
    }

    if (res.code === '200') {
      const data = res.data as PageResponse<MbrTeamDaily>
      memberList.value = [...memberList.value, ...data.list]
      total.value = data.total

      if (memberList.value.length >= total.value) {
        finished.value = true
      }
    }
  }
  catch (e) {
    console.error('loadMembers error:', e)
    showToast({ message: 'Failed to load members', type: 'fail' })
  }
  finally {
    loading.value = false
  }
}

async function onLoadMore() {
  if (finished.value)
    return
  page.value++
  await loadMembers()
}

function changeLevel(level: number) {
  if (currentLevel.value === level)
    return
  currentLevel.value = level
  memberList.value = []
  page.value = 1
  finished.value = false
  // Do NOT set loading.value = true here, let loadMembers handle it or reset it
  loading.value = false
  loadMembers()
}

function getLevelColor(level: string) {
  const key = level.replace(/^level/i, '')
  const colors: Record<string, string> = {
    1: 'text-[#FF9933]',
    2: 'text-[#138808]',
    3: 'text-[#FF6600]',
  }
  return colors[key] || 'text-gray-500'
}

function getLevelBg(level: string) {
  const key = level.replace(/^level/i, '')
  const colors: Record<string, string> = {
    1: 'bg-[#FFF3E6]',
    2: 'bg-[#F0FDF0]',
    3: 'bg-[#FFF0E6]',
  }
  return colors[key] || 'bg-gray-50'
}

function openDetail(_member: MbrTeamDaily) {
  // Details popup removed as per request
}
</script>

<template>
  <div class="bg-[#FFF9F5] min-h-screen">
    <div class="mx-auto px-3 py-3 max-w-[480px]">
      <!-- Summary -->
      <div class="text-white mb-3 p-4 rounded-2xl shadow-sm from-[#FF9933] to-[#FF6600] bg-gradient-to-r">
        <div class="text-center">
          <div class="text-3xl font-700 mb-1">
            {{ teamHomeData?.teamCount || 0 }}
          </div>
          <div class="text-sm opacity-90">
            Total Members
          </div>
        </div>
      </div>
      <div class="mb-4 flex gap-2 justify-between">
        <div
          class="p-1 text-center border rounded flex-1 cursor-pointer transition-colors"
          :class="currentLevel === 1 ? 'border-red-500 bg-red-50' : 'border-gray-200'"
          @click="changeLevel(1)"
        >
          <span class="text-xs" :class="currentLevel === 1 ? 'text-red-500' : 'text-gray-500'">Level 1: {{ teamHomeData?.level1 || '0%' }}</span>
        </div>
        <div
          class="p-1 text-center border rounded flex-1 cursor-pointer transition-colors"
          :class="currentLevel === 2 ? 'border-red-500 bg-red-50' : 'border-gray-200'"
          @click="changeLevel(2)"
        >
          <span class="text-xs" :class="currentLevel === 2 ? 'text-red-500' : 'text-gray-500'">Level 2: {{ teamHomeData?.level2 || '0%' }}</span>
        </div>
        <div
          class="p-1 text-center border rounded flex-1 cursor-pointer transition-colors"
          :class="currentLevel === 3 ? 'border-red-500 bg-red-50' : 'border-gray-200'"
          @click="changeLevel(3)"
        >
          <span class="text-xs" :class="currentLevel === 3 ? 'text-red-500' : 'text-gray-500'">Level 3: {{ teamHomeData?.level3 || '0%' }}</span>
        </div>
      </div>

      <van-pull-refresh v-model="refreshing" class="min-h-[60vh]" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="No more members"
          @load="onLoadMore"
        >
          <div class="space-y-3">
            <div
              v-for="(member, index) in memberList"
              :key="index"
              class="p-4 rounded-2xl bg-white shadow-sm transition-opacity active:opacity-90"
              @click="openDetail(member)"
            >
              <div class="mb-3 flex items-center justify-between">
                <div class="flex gap-3 items-center">
                  <div class="text-white font-600 rounded-full flex h-10 w-10 items-center justify-center from-[#FF9933] to-[#FF6600] bg-gradient-to-br">
                    {{ member.username?.charAt(0)?.toUpperCase() || 'U' }}
                  </div>
                  <div>
                    <div class="text-sm text-gray-900 font-600">
                      {{ member.username }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Trader
                    </div>
                  </div>
                </div>

                <div
                  class="text-xs font-600 px-3 py-1 rounded-full"
                  :class="[getLevelBg(String(currentLevel)), getLevelColor(String(currentLevel))]"
                >
                  Level {{ currentLevel }}
                </div>
              </div>

              <!-- Key Stats -->
              <div class="mt-2 py-2 border-t border-gray-50 gap-2 grid grid-cols-2">
                <div class="text-center border-r border-gray-100">
                  <div class="text-xs text-gray-400 mb-1">
                    Buy (Currency)
                  </div>
                  <div class="text-sm text-gray-800 font-600">
                    {{ member.buyCurrencyAmt || 0 }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-400 mb-1">
                    Commission
                  </div>
                  <div class="text-sm text-[#FF9933] font-600">
                    {{ member.dividendAmt || 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-list>

        <div v-if="memberList.length === 0 && !loading" class="py-12">
          <div class="p-8 text-center rounded-2xl bg-white shadow-sm">
            <div class="mx-auto mb-4 rounded-full bg-[#FFF3E6] flex h-20 w-20 items-center justify-center">
              <div class="i-carbon:group text-4xl text-[#FF9933]" />
            </div>
            <p class="text-sm text-gray-600">
              No team members yet
            </p>

            <!-- 阶梯奖励明细列表 -->
            <div v-if="inviteReward?.inviteFriends?.length" class="mt-8 pt-6 text-left border-t border-gray-100">
              <div class="mb-4 flex gap-2 items-center">
                <div class="i-carbon:gift text-lg text-[#FF9933]" />
                <span class="text-sm text-gray-900 font-600">Invite Rewards</span>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(item, index) in inviteReward.inviteFriends"
                  :key="index"
                  class="p-3 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between"
                >
                  <div class="flex gap-3 items-center">
                    <div
                      class="text-xs font-700 rounded-full flex h-8 w-8 items-center justify-center"
                      :class="item.done ? 'bg-[#F0FDF0] text-[#138808]' : 'bg-[#FFF3E6] text-[#FF9933]'"
                    >
                      {{ index + 1 }}
                    </div>
                    <div>
                      <div class="text-xs text-gray-500">
                        Invite {{ item.targetCnt }} Friends
                      </div>
                      <div class="text-sm text-[#FF9933] font-700">
                        Get ₹{{ item.bonus }}
                      </div>
                    </div>
                  </div>

                  <div
                    class="text-[10px] font-600 px-2 py-1 rounded uppercase"
                    :class="item.done ? 'bg-[#F0FDF0] text-[#138808]' : 'bg-gray-200 text-gray-500'"
                  >
                    {{ item.done ? 'Done' : 'Pending' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<route lang="json5">
{
  name: 'TeamMembers'
}
</route>
