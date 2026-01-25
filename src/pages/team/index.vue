<script setup lang="ts">
import { showToast } from 'vant'
import type { DailyProfitData, TeamHomeData } from '@/api/team'
import { getDailyProfit, getTeamHome } from '@/api/team'
import QRCode from 'qrcode'
import { STORAGE_USER_KEY } from '@/stores/mutation-type'

const router = useRouter()
const loading = ref(false)
const teamData = ref<TeamHomeData | null>(null)
const showInviteLink = ref(true)
const inviteQrCodeUrl = ref('')
const showDailyProfitDialog = ref(false)
const showDetailsDialog = ref(false)
const showQrDialog = ref(false)
const dailyProfitData = ref<DailyProfitData | null>(null)
const selectedDate = ref('')
const showCalendar = ref(false)
const minCalendarDate = new Date(2020, 0, 1)
const maxCalendarDate = new Date()
const qrCenterText = 'DEMO'
const appOrigin = import.meta.env.VITE_APP_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : '')
const DefaultTeamData: TeamHomeData = {
  dailyMaxTasksExtReward: 0,
  dailyTaskExtReward: 0,
  inviteCode: '',
  level1: '0.3',
  level2: '0.2',
  level3: '0.1',
  myTotalProfit: 0,
  teamCount: 0,
  todayTeamCommission: 0,
  totalCommission: 0,
  yesterdayTeamCommission: 0,
}
const DefaultDailyProfitData: DailyProfitData = {
  eventReward: 0,
  inrBuyTimes: 0,
  inrBuyToken: 0,
  inrTradeProfit: 0,
  sellTimes: 0,
  sellToken: 0,
  teamProfit: 0,
  totalProfit: 0,
}

onMounted(async () => {
  // 使用 nextTick 延迟数据加载，让页面先渲染
  await nextTick()
  // 初始化默认数据，确保页面先渲染
  teamData.value = { ...DefaultTeamData }
  await loadTeamData()
})

async function loadTeamData() {
  try {
    loading.value = true
    const res = await getTeamHome()
    if (res.code === '200') {
      teamData.value = res.data
    }
  }
  catch {
    showToast({ message: 'Failed to load team data', type: 'fail' })
    // 请求失败时，保持默认数据，不再覆盖为空，避免页面闪烁或错误
    if (!teamData.value) {
      teamData.value = { ...DefaultTeamData }
    }
  }
  finally {
    loading.value = false
  }
}

function goToTeamMembers() {
  router.push('/team/members')
}

async function showMyTotalProfit() {
  selectedDate.value = new Date().toISOString().split('T')[0]
  await loadDailyProfit(selectedDate.value)
  showDailyProfitDialog.value = true
}

async function loadDailyProfit(date: string) {
  try {
    const res = await getDailyProfit({ date })
    if (res.code === '200') {
      dailyProfitData.value = res.data
    }
  }
  catch {
    showToast({ message: 'Failed to load daily profit', type: 'fail' })
    dailyProfitData.value = { ...DefaultDailyProfitData }
  }
  finally {
    if (!dailyProfitData.value)
      dailyProfitData.value = { ...DefaultDailyProfitData }
  }
}

function goToInviteFriendsReward() {
  router.push('/team/invite-rewards')
}

function goToRecallReward() {
  router.push('/team/recall-rewards')
}

function showDetails() {
  showDetailsDialog.value = true
}

function copyInviteLink() {
  if (teamData.value?.inviteCode) {
    const link = `${appOrigin}/register/${teamData.value.inviteCode}`
    navigator.clipboard.writeText(link)
    showToast({ message: 'Invitation link copied', type: 'success' })
  }
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

async function showQrCode() {
  if (!teamData.value?.inviteCode)
    return
  const link = `${appOrigin}/register/${teamData.value.inviteCode}`
  try {
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, link, { width: 220, margin: 2, errorCorrectionLevel: 'H' })
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const size = canvas.width
      const box = Math.floor(size * 0.22)
      const x = Math.floor((size - box) / 2)
      const y = Math.floor((size - box) / 2)
      drawRoundRect(ctx, x, y, box, box, Math.floor(box * 0.2))
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.fillStyle = '#333'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${Math.floor(box * 0.36)}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
      ctx.fillText(qrCenterText, x + box / 2, y + box / 2)
    }
    inviteQrCodeUrl.value = canvas.toDataURL()
    showQrDialog.value = true
  }
  catch {
    showToast({ message: 'Failed to generate QR', type: 'fail' })
  }
}

function saveQrCode() {
  if (!inviteQrCodeUrl.value)
    return
  const a = document.createElement('a')
  a.href = inviteQrCodeUrl.value
  const code = teamData.value?.inviteCode || 'invite'
  a.download = `qr-${code}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function goToCustomerService() {
  showToast({ message: 'Opening customer service...', type: 'success' })
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

function getDailyTaskProgress() {
  if (!teamData.value)
    return 0
  const maxTasks = 500
  const current = teamData.value.dailyTaskExtReward
  return Math.min((current / maxTasks) * 100, 100)
}

function formatRate(val: string | number | undefined) {
  if (!val)
    return '0%'
  const str = String(val)
  return str.includes('%') ? str : `${str}%`
}

function formatNumber(val: any, digits?: number) {
  const num = Number(val)
  if (!Number.isFinite(num))
    return digits != null ? Number(0).toFixed(digits) : '0'
  const opts: Intl.NumberFormatOptions = {}
  if (digits != null) {
    opts.minimumFractionDigits = digits
    opts.maximumFractionDigits = digits
  }
  return new Intl.NumberFormat('en-IN', opts).format(num)
}

const inviteLink = computed(() => {
  if (!teamData.value?.inviteCode)
    return ''
  return `${appOrigin}/register/${teamData.value.inviteCode}`
})

function maskCode(code: string) {
  if (!code)
    return ''
  const len = code.length
  const keep = Math.max(3, Math.floor(len * 0.3))
  const start = code.slice(0, keep)
  const end = code.slice(-keep)
  return `${start}****${end}`
}

const maskedInviteLink = computed(() => {
  if (!teamData.value?.inviteCode)
    return ''
  return `${appOrigin}/register/${maskCode(teamData.value.inviteCode)}`
})

const userId = computed(() => {
  try {
    const s = localStorage.getItem(STORAGE_USER_KEY) || ''
    const obj = s ? JSON.parse(s) : {}
    return String(obj?.uid || '')
  }
  catch {
    return ''
  }
})
function openCalendar() {
  showCalendar.value = true
}

function onConfirmDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  selectedDate.value = `${y}-${m}-${d}`
  showCalendar.value = false
  loadDailyProfit(selectedDate.value)
}
</script>

<template>
  <div class="bg-[#FFF9F5] min-h-screen">
    <van-skeleton :loading="loading" :row="10">
      <div v-if="teamData" class="pb-4">
        <div class="mt-3 px-3 space-y-3">
          <!-- Team Stats Card -->
          <div class="mb-3 rounded-2xl bg-white shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between active:bg-orange-50" @click="goToTeamMembers">
              <div class="flex gap-3 items-center">
                <div class="rounded-full bg-[#FFF3E6] flex h-10 w-10 items-center justify-center">
                  <div class="i-carbon:group text-xl text-[#FF9933]" />
                </div>
                <span class="text-sm text-gray-800 font-500">Team Count</span>
              </div>
              <div class="flex gap-2 items-center">
                <span class="text-base text-[#FF9933] font-700">{{ formatNumber(teamData.teamCount, 0) }}</span>
                <div class="i-carbon:chevron-right text-gray-400" />
              </div>
            </div>
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div class="flex gap-3 items-center">
                <div class="rounded-full bg-[#F0FDF0] flex h-10 w-10 items-center justify-center">
                  <div class="i-carbon:currency-rupee text-xl text-[#138808]" />
                </div>
                <span class="text-sm text-gray-800 font-500">Total Commission</span>
              </div>
              <span class="text-base text-[#138808] font-700" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(teamData.totalCommission, 2) }}</span>
            </div>
            <div class="px-4 py-3 flex items-center justify-between active:bg-orange-50" @click="showMyTotalProfit">
              <div class="flex gap-3 items-center">
                <div class="rounded-full bg-[#EBF5FF] flex h-10 w-10 items-center justify-center">
                  <div class="i-carbon:chart-bar text-xl text-[#3B82F6]" />
                </div>
                <span class="text-sm text-gray-800 font-500">My Total Profit</span>
              </div>
              <div class="flex gap-2 items-center">
                <span class="text-base text-[#FF9933] font-700" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(teamData.myTotalProfit, 2) }}</span>
                <div class="i-carbon:chevron-right text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Commission Overview Card (Main Area ~61.8%) -->
          <div class="mb-3 p-4 rounded-2xl bg-white shadow-sm overflow-hidden">
            <div class="mb-3 pb-3 border-b border-gray-100">
              <span class="text-sm text-gray-800 font-600">Commission Overview</span>
            </div>

            <div class="mb-4 gap-4 grid grid-cols-2">
              <div class="p-2 rounded-xl flex flex-col gap-1 cursor-pointer transition-colors active:bg-orange-50" @click="showDetails">
                <span class="text-xs text-gray-500">Yesterday Team Commission</span>
                <span class="text-lg text-[#FF9933] font-700" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(teamData.yesterdayTeamCommission, 2) }}</span>
              </div>
              <div class="p-2 flex flex-col gap-1">
                <span class="text-xs text-gray-500">Today Team Commission</span>
                <span class="text-lg text-[#138808] font-700" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(teamData.todayTeamCommission, 2) }}</span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-gray-50">
              <div class="text-xs text-gray-500 mb-2 flex items-center justify-between">
                <span>0</span>
                <span class="text-[#FF9933] font-500">Daily Tasks {{ getDailyTaskProgress().toFixed(0) }}%</span>
                <span>500</span>
              </div>
              <div class="rounded-full bg-gray-200 h-2.5 w-full relative overflow-hidden">
                <div
                  class="rounded-full h-full transition-all duration-500 absolute from-[#FF9933] to-[#138808] bg-gradient-to-r"
                  :style="{ width: `${getDailyTaskProgress()}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Rewards Card (Secondary Area ~38.2%) -->
          <div class="mb-3 gap-3 grid grid-cols-2">
            <div class="p-3 rounded-2xl bg-white flex flex-col gap-2 shadow-sm transition-transform items-center justify-center active:scale-95" @click="goToInviteFriendsReward">
              <div class="rounded-full bg-[#FEF3C7] flex h-12 w-12 items-center justify-center">
                <div class="i-carbon:gift text-2xl text-[#F59E0B]" />
              </div>
              <span class="text-xs text-gray-800 font-600 text-center">Invite Friends<br>Reward</span>
            </div>
            <div class="p-3 rounded-2xl bg-white flex flex-col gap-2 shadow-sm transition-transform items-center justify-center active:scale-95" @click="goToRecallReward">
              <div class="rounded-full bg-[#F3E8FF] flex h-12 w-12 items-center justify-center">
                <div class="i-carbon:notification text-2xl text-[#9333EA]" />
              </div>
              <span class="text-xs text-gray-800 font-600 text-center">Recall Friends<br>Reward</span>
            </div>
          </div>

          <!-- Invitation Link -->
          <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-[#FFE4CC] bg-[#FFF9F5]">
              <div class="flex items-center justify-between">
                <div class="flex gap-2 items-center">
                  <div class="i-carbon:link text-lg text-[#FF9933]" />
                  <span class="text-sm text-gray-900 font-600">Invitation Link</span>
                </div>
                <button
                  class="text-xs text-[#FF9933] font-500 px-3 py-1 border border-[#FFE4CC] rounded-lg bg-white"
                  @click="showInviteLink = !showInviteLink"
                >
                  {{ showInviteLink ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <div class="p-4 space-y-3">
              <div class="text-sm text-gray-800 font-mono px-3 py-3 border border-[#FFE4CC] rounded-xl bg-[#FFF9F5] truncate">
                {{ showInviteLink ? inviteLink : maskedInviteLink }}
              </div>

              <div class="gap-3 grid grid-cols-2">
                <button
                  class="text-sm text-white font-500 py-3 rounded-xl bg-[#FF9933] flex gap-2 items-center justify-center active:bg-[#E68A2E]"
                  @click="copyInviteLink"
                >
                  <div class="i-carbon:copy" /> Copy Link
                </button>
                <button
                  class="text-sm text-white font-500 py-3 rounded-xl bg-[#FF9933] flex gap-2 items-center justify-center active:bg-[#E68A2E]"
                  @click="showQrCode"
                >
                  <div class="i-carbon:qr-code" /> QR Code
                </button>
              </div>
            </div>
          </div>

          <!-- Commission Levels -->
          <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100">
              <span class="text-sm text-gray-800 font-600">Commission Rates</span>
            </div>
            <div class="p-4 space-y-3">
              <div class="p-3 rounded-xl bg-[#FFF9F5] flex items-center justify-between">
                <div class="flex gap-3 items-center">
                  <div class="text-sm text-[#FF9933] font-600 rounded-full bg-[#FFE4CC] flex h-8 w-8 items-center justify-center">
                    L1
                  </div>
                  <span class="text-sm text-gray-600">Level 1</span>
                </div>
                <span class="text-base text-[#FF9933] font-700">{{ formatRate(teamData.level1) }}</span>
              </div>

              <div class="p-3 rounded-xl bg-[#F0FDF0] flex items-center justify-between">
                <div class="flex gap-3 items-center">
                  <div class="text-sm text-[#138808] font-600 rounded-full bg-[#D1FAE5] flex h-8 w-8 items-center justify-center">
                    L2
                  </div>
                  <span class="text-sm text-gray-600">Level 2</span>
                </div>
                <span class="text-base text-[#138808] font-700">{{ formatRate(teamData.level2) }}</span>
              </div>

              <div class="p-3 rounded-xl bg-[#EBF5FF] flex items-center justify-between">
                <div class="flex gap-3 items-center">
                  <div class="text-sm text-blue-600 font-600 rounded-full bg-[#BFDBFE] flex h-8 w-8 items-center justify-center">
                    L3
                  </div>
                  <span class="text-sm text-gray-600">Level 3</span>
                </div>
                <span class="text-base text-blue-600 font-700">{{ formatRate(teamData.level3) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-1">
        <van-empty description="No team data available" />
      </div>
    </van-skeleton>

    <!-- Daily Profit Dialog -->
    <van-dialog v-model:show="showDailyProfitDialog" title="Daily Profit" class-name="daily-profit-dialog">
      <div v-if="dailyProfitData" class="p-2 space-y-2">
        <VanCellGroup :inset="true">
          <van-cell is-link @click="openCalendar">
            <template #title>
              Profit Date
            </template>
            <template #value>
              <span class="text-blue-600 font-600">{{ formatDate(selectedDate) }}</span>
            </template>
          </van-cell>
        </VanCellGroup>
        <van-calendar v-model:show="showCalendar" :min-date="minCalendarDate" :max-date="maxCalendarDate" @confirm="onConfirmDate" />

        <VanCellGroup :inset="true">
          <van-cell>
            <template #title>
              <span class="font-600">Buy Times (INR)</span>
            </template>
            <template #value>
              <span class="text-blue-600 font-600" style="font-variant-numeric: tabular-nums">{{ formatNumber(dailyProfitData.inrBuyTimes, 0) }}</span>
            </template>
          </van-cell>
          <van-cell>
            <template #title>
              <span class="font-600">Buy IToken (INR)</span>
            </template>
            <template #value>
              <span class="text-blue-600 font-600" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(dailyProfitData.inrBuyToken, 2) }}</span>
            </template>
          </van-cell>
          <van-cell>
            <template #title>
              <span class="font-600">Trade Profit (INR)</span>
            </template>
            <template #value>
              <span class="text-blue-600 font-600" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(dailyProfitData.inrTradeProfit, 2) }}</span>
            </template>
          </van-cell>
          <van-cell>
            <template #title>
              <span class="font-600">Team Profit</span>
            </template>
            <template #value>
              <span class="text-blue-600 font-600" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(dailyProfitData.teamProfit, 2) }}</span>
            </template>
          </van-cell>
          <van-cell>
            <template #title>
              <span class="font-600">Event Reward</span>
            </template>
            <template #value>
              <span class="text-blue-600 font-600" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(dailyProfitData.eventReward, 2) }}</span>
            </template>
          </van-cell>
          <van-cell>
            <template #title>
              <span class="font-600">Sell IToken</span>
            </template>
            <template #value>
              <span class="text-blue-600 font-600" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(dailyProfitData.sellToken, 2) }}</span>
            </template>
          </van-cell>
          <van-cell>
            <template #title>
              <span class="font-600">Sell Times</span>
            </template>
            <template #value>
              <span class="text-blue-600 font-600" style="font-variant-numeric: tabular-nums">{{ formatNumber(dailyProfitData.sellTimes, 0) }}</span>
            </template>
          </van-cell>
          <van-cell>
            <template #title>
              <span class="font-600">Total Profit</span>
            </template>
            <template #value>
              <span class="text-blue-600 font-700" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(dailyProfitData.totalProfit, 2) }}</span>
            </template>
          </van-cell>
        </VanCellGroup>
      </div>

      <template #footer>
        <van-button block type="primary" @click="showDailyProfitDialog = false">
          Close
        </van-button>
      </template>
    </van-dialog>

    <!-- Details Dialog -->
    <van-dialog v-model:show="showDetailsDialog" title="Details" class-name="details-dialog">
      <div v-if="teamData" class="p-3 space-y-3">
        <div class="p-3 rounded-xl bg-blue-50">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-700 font-500">ID</span>
            <span class="text-base text-blue-600 font-700">{{ userId }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="p-3 rounded-xl bg-blue-50 flex items-center justify-between">
            <span class="text-xs text-gray-700 font-500">Yesterday Commission</span>
            <span class="text-base text-blue-600 tracking-tight font-700" style="font-variant-numeric: tabular-nums">₹{{ formatNumber(teamData.yesterdayTeamCommission, 2) }}</span>
          </div>

          <div class="p-3 border-l-4 border-blue-500 rounded-lg bg-blue-50">
            <p class="text-xs text-gray-700 leading-relaxed mb-1 flex gap-1 items-center">
              <span class="i-carbon:camera inline-block" /> Take a screenshot of this interface and click Go to jump to your customer service group.
            </p>
            <p class="text-xs text-blue-600 font-500 mb-1 flex gap-1 items-center">
              <span class="i-carbon:warning inline-block" /> Minimum commission required: ₹500
            </p>
            <p class="text-xs text-gray-600 flex gap-1 items-center">
              <span class="i-carbon:time inline-block" /> Collection time: 11:00-21:00 the next day
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="p-3 flex flex-col gap-2">
          <van-button block type="primary" @click="goToCustomerService">
            Go to Customer Service
          </van-button>
          <van-button plain block @click="showDetailsDialog = false">
            Close
          </van-button>
        </div>
      </template>
    </van-dialog>

    <!-- QR Code Dialog -->
    <van-dialog v-model:show="showQrDialog" :title="teamData?.inviteCode || 'Invite Code'" class-name="qr-dialog">
      <div class="p-3 flex flex-col items-center">
        <img v-if="inviteQrCodeUrl" :src="inviteQrCodeUrl" alt="Invite QR Code" class="h-48 w-48">
      </div>
      <template #footer>
        <div class="p-3 flex flex-col gap-2">
          <van-button block type="primary" @click="saveQrCode">
            Save Image
          </van-button>
          <van-button plain block @click="showQrDialog = false">
            Close
          </van-button>
        </div>
      </template>
    </van-dialog>
  </div>
</template>

<route lang="json5">
{
  name: 'Team'
}
</route>
