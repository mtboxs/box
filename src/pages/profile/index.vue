<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { showToast, showDialog } from 'vant'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// Check if bank card is bound
const hasBankCard = computed(() => {
  return !!(userInfo.value.bankCardNo && userInfo.value.bankName)
})

onMounted(() => {
  userStore.info()
})

// Recharge Dialog
const showRechargeDialog = ref(false)
const rechargeAmount = ref('')

const handleRecharge = () => {
  showRechargeDialog.value = true
}

const submitRecharge = () => {
  if (!rechargeAmount.value || Number(rechargeAmount.value) <= 0) {
    showToast(t('profile.enterAmount'))
    return
  }
  // TODO: Call recharge API
  showToast(t('profile.rechargeSubmitted'))
  showRechargeDialog.value = false
  rechargeAmount.value = ''
}

// Withdraw Action
const showWithdrawSheet = ref(false)

const handleWithdraw = () => {
  // Check if bank card is bound
  if (!hasBankCard.value) {
    showDialog({
      title: t('profile.tips'),
      message: t('profile.bindBankCardFirst'),
      confirmButtonText: t('profile.goToBind'),
      cancelButtonText: t('profile.cancel'),
      showCancelButton: true,
    }).then(() => {
      router.push('/profile/bank-card')
    }).catch(() => {})
    return
  }
  showWithdrawSheet.value = true
}

const withdrawActions = computed(() => [
  { name: t('profile.bankCard') + ': ' + maskBankCard(userInfo.value.bankCardNo), color: '#000000' }
])

const maskBankCard = (cardNo: string) => {
  if (!cardNo || cardNo.length < 8) return cardNo || '---'
  return cardNo.slice(0, 4) + ' **** **** ' + cardNo.slice(-4)
}

const handleWithdrawSelect = () => {
  showWithdrawSheet.value = false
  // TODO: Navigate to withdraw form or show withdraw dialog
  showToast(t('profile.withdrawFeatureComing'))
}

const menuItems = computed(() => [
  { icon: 'balance-list-o', title: t('profile.rechargeRecord'), path: '/profile/recharge-record' },
  { icon: 'bill-o', title: t('profile.withdrawRecord'), path: '/profile/withdraw-record' },
  { icon: 'gold-coin-o', title: t('profile.details'), path: '/profile/fund-details' },
  { icon: 'card', title: t('profile.bankCard'), path: '/profile/bank-card', badge: !hasBankCard.value ? t('profile.notBound') : '' },
  { icon: 'lock', title: t('profile.changePassword'), path: '/profile/change-password' },
])

const orderActions = computed(() => [
  { icon: 'orders-o', title: t('profile.joinBuy'), path: '/profile/order-record?tab=participating' },
  { icon: 'refund-o', title: t('profile.sellBack'), path: '/profile/order-record?tab=repurchase' },
  { icon: 'star-o', title: t('profile.collection'), path: '/profile/collection' },
])

const handleNavigate = (path?: string) => {
  if (path) {
    router.push(path)
  }
}

const handleLogout = () => {
  showDialog({
    title: t('profile.confirmLogout'),
    message: t('profile.confirmLogoutMsg'),
    confirmButtonText: t('profile.confirm'),
    cancelButtonText: t('profile.cancel'),
    showCancelButton: true,
  }).then(() => {
    userStore.logout()
    router.push({ name: 'Login' })
  }).catch(() => {})
}

const formatCurrency = (val: number | string | undefined) => {
  return Number(val || 0).toFixed(2)
}

// Get VIP level display
const vipLevelDisplay = computed(() => {
  const level = userInfo.value.vipLevel || '0'
  return 'VIP' + level
})
</script>

<template>
  <div class="bg-gray-100 min-h-screen pb-24">
    <!-- Top Header / Profile Section -->
    <div class="bg-[#1a1a1a] text-white relative pb-20 rounded-b-[30px] overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-black opacity-90"></div>

      <!-- Top Bar Content -->
      <div class="relative z-10 p-5 pt-8 flex items-start justify-between">
        <div class="flex items-center gap-3">
          <!-- Avatar -->
          <div class="w-14 h-14 rounded-full border border-gray-600 overflow-hidden bg-gray-800">
             <img
               :src="userInfo.logoNumber || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'"
               alt="Avatar"
               class="w-full h-full object-cover"
             />
          </div>

          <!-- User Info -->
          <div>
            <div class="text-lg font-bold">{{ userInfo.username || userInfo.nickname || 'User' }}</div>
            <div class="text-gray-400 text-xs mt-0.5">{{ t('profile.id') }}: {{ userInfo.uid || userInfo.id || '---' }}</div>
          </div>
        </div>

        <!-- Right Badge Info -->
        <div class="flex flex-col items-end gap-1">
           <div class="bg-white text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
             {{ vipLevelDisplay }}
           </div>
           <div class="flex items-center gap-1 text-[10px] text-gray-300 mt-1">
             <span>{{ t('profile.inviteCode') }}: {{ userInfo.inviteCode || '---' }}</span>
           </div>
           <div class="text-[10px] text-gray-300">
             {{ t('profile.creditScore') }}: {{ userInfo.integral || 100 }}
           </div>
        </div>
      </div>
    </div>

    <!-- Floating Balance Card Area -->
    <div class="px-4 -mt-16 relative z-20">
      <div class="bg-[#2c2c2c] rounded-2xl p-5 shadow-xl text-white">
         <div class="text-center mb-5 border-b border-gray-600 pb-4 relative">
            <div class="text-xl font-bold tracking-tight">{{ t('profile.totalBalance') }}: {{ formatCurrency(userInfo.balance) }}฿</div>
         </div>

         <div class="flex relative items-center mb-6">
            <!-- Vertical Divider -->
            <div class="w-px h-8 bg-gray-600 mx-auto absolute left-1/2 -translate-x-1/2"></div>

            <div class="flex-1 text-center pr-2">
               <div class="text-xs text-gray-300 mb-1">{{ t('profile.todayIncome') }}</div>
               <div class="text-lg font-bold">{{ formatCurrency(userInfo.todayEarnings) }}฿</div>
            </div>
            <div class="flex-1 text-center pl-2">
               <div class="text-xs text-gray-300 mb-1">{{ t('profile.totalIncome') }}</div>
               <div class="text-lg font-bold">{{ formatCurrency(userInfo.totalRevenue) }}฿</div>
            </div>
         </div>

         <!-- Primary Action Buttons Row -->
         <div class="flex gap-4 mb-3">
            <button
              @click="handleRecharge"
              class="flex-1 bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-bold py-2.5 rounded-full shadow-md transition-colors"
            >
              {{ t('profile.recharge') }}
            </button>
            <button
              @click="handleWithdraw"
              class="flex-1 bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-bold py-2.5 rounded-full shadow-md transition-colors"
            >
              {{ t('profile.withdraw') }}
            </button>
         </div>

         <!-- Secondary Action Buttons Row -->
         <div class="flex gap-4">
            <button
              @click="handleNavigate('/profile/recharge-record')"
              class="flex-1 bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-bold py-2.5 rounded-full shadow-md transition-colors"
            >
              {{ t('profile.rechargeRecord') }}
            </button>
            <button
              @click="handleNavigate('/profile/withdraw-record')"
              class="flex-1 bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-bold py-2.5 rounded-full shadow-md transition-colors"
            >
              {{ t('profile.withdrawRecord') }}
            </button>
         </div>
      </div>
    </div>

    <!-- My Orders Section -->
    <div class="px-4 mt-4">
       <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="font-bold text-gray-900 mb-4 text-sm">{{ t('profile.myOrders') }}</h3>
          <div class="flex justify-around">
             <div
               v-for="(item, idx) in orderActions"
               :key="idx"
               class="flex flex-col items-center gap-2 cursor-pointer active:opacity-70"
               @click="handleNavigate(item.path)"
             >
                <div class="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-black">
                   <van-icon :name="item.icon" size="20" />
                </div>
                <span class="text-xs text-gray-600">{{ item.title }}</span>
             </div>
          </div>
       </div>
    </div>

    <!-- Menu List -->
    <div class="px-4 mt-4 space-y-3">
       <div class="bg-white rounded-xl overflow-hidden shadow-sm">
          <van-cell
             v-for="(item, idx) in menuItems"
             :key="idx"
             :title="item.title"
             is-link
             :to="item.path"
             class="items-center py-3.5"
             :border="idx !== menuItems.length - 1"
          >
             <template #icon>
                <div class="w-6 flex justify-center mr-2">
                   <van-icon :name="item.icon" size="18" color="#1F2937" />
                </div>
             </template>
             <template #value>
                <span v-if="item.badge" class="text-xs text-red-500">{{ item.badge }}</span>
             </template>
          </van-cell>
       </div>
    </div>

    <!-- Sign Out Button -->
    <div class="px-4 mt-8 text-center">
       <button
         @click="handleLogout"
         class="text-black font-medium text-sm px-8 py-2 bg-white rounded-full shadow-sm active:scale-95 transition-transform"
       >
         {{ t('profile.logout') }}
       </button>
    </div>

    <!-- Withdraw Action Sheet -->
    <van-action-sheet
      v-model:show="showWithdrawSheet"
      :actions="withdrawActions"
      :cancel-text="t('profile.cancel')"
      :description="t('profile.selectWithdrawMethod')"
      close-on-click-action
      @select="handleWithdrawSelect"
    />

    <!-- Recharge Dialog -->
    <van-dialog
      v-model:show="showRechargeDialog"
      :title="t('profile.recharge')"
      show-cancel-button
      :confirm-button-text="t('profile.confirm')"
      :cancel-button-text="t('profile.cancel')"
      @confirm="submitRecharge"
    >
      <div class="p-4">
        <van-field
          v-model="rechargeAmount"
          type="number"
          :label="t('profile.amount')"
          :placeholder="t('profile.enterAmount')"
        />
        <p class="text-xs text-gray-500 mt-2">{{ t('profile.rechargeHint') }}</p>
      </div>
    </van-dialog>

  </div>
</template>

<style scoped>
:deep(.van-cell) {
  background-color: transparent;
}
:deep(.van-cell__title) {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}
:deep(.van-cell::after) {
  border-bottom-color: #f3f4f6;
}
</style>

<route lang="json5">
{
  name: 'Profile',
  meta: {
    title: 'Profile',
    i18n: 'menus.profile'
  }
}
</route>
