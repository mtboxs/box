import request from '@/utils/request'

export interface ApiResponse<T> {
  code: string
  data: T
  msg: string
}

export interface RewardItem {
  conditionAmt: number
  conditionVal: number
  done: boolean
  frontUrl: string
  rewardAmt: number
  settleAmt: number
  sortNo: number
  title: string
}

export interface DailyBuyInrRewardInfo {
  finishedAmount: number
  items: RewardItem[]
  receivedReward: number
  totalAmount: number
  yesterdayReward: number
}

export interface LinkUpiRewardInfo {
  doneCnt: number
  items: RewardItem[]
  receivedBonus: number
  totalBonus: number
}

export interface NewbieRewardInfo {
  done: boolean
  items: RewardItem[]
  totalBonus: number
}

export interface TodayProfitData {
  eventReward: number
  teamProfit: number
  tradeProfit: number
}

export interface TokenDetailData {
  availableAmount: number
  inSellAmount: number
}

export interface MemberUpdPasswordRequest {
  newPassword: string
  otp: string
}

export interface SellLimitUpdRequest {
  amount: number
}

export function getDailyBuyReward(): Promise<ApiResponse<DailyBuyInrRewardInfo>> {
  const form = new URLSearchParams()
  return request.post('/mine/dailyBuyReward.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function getLinkUpiReward(): Promise<ApiResponse<LinkUpiRewardInfo>> {
  const form = new URLSearchParams()
  return request.post('/mine/linkUpiReward.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function getNewbieReward(): Promise<ApiResponse<NewbieRewardInfo>> {
  const form = new URLSearchParams()
  return request.post('/mine/newbieReward.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function getTodayProfit(): Promise<ApiResponse<TodayProfitData>> {
  const form = new URLSearchParams()
  return request.post('/mine/todayProfit.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function getTokenDetail(): Promise<ApiResponse<TokenDetailData>> {
  const form = new URLSearchParams()
  return request.post('/mine/tokenDetail.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function updatePassword(data: MemberUpdPasswordRequest): Promise<ApiResponse<void>> {
  return request.post('/mine/updPassword.do', { request: data }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function updateSellLimit(data: SellLimitUpdRequest): Promise<ApiResponse<void>> {
  return request.post('/mine/updSellLimit.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}
