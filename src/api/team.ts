import request from '@/utils/request'

export interface ApiResponse<T> {
  code: string
  data: T
  msg: string
}

export interface PageRequest {
  page?: number
  pageSize?: number
}

export interface PageResponse<T> {
  list: T[]
  page: number
  pageSize: number
  total: number
  totalPage: number
}

// 团队首页数据
export interface TeamHomeData {
  dailyMaxTasksExtReward: number // 每日最大任务额外返利
  dailyTaskExtReward: number // 每日累计任务额外返利
  inviteCode: string // 邀请码
  level1: string // level1 返佣
  level2: string // level2 返佣
  level3: string // level3 返佣
  myTotalProfit: number // 个人总利润
  teamCount: number // 团队人数
  todayTeamCommission: number // 今日团队佣金
  totalCommission: number // 团队总佣金
  yesterdayTeamCommission: number // 昨日团队佣金
}

// 召回好友数据
export interface RecallFriendsData {
  alreadyBuy: number // 已购金额
  needBuy: number // 需购金额
  username: string // 用户名
}

// 召回好友奖励
export interface RecallFriendsReward {
  bonus: number // 可获得奖励
  canCalledFriends: number // 可召回好友数
  recallFriends: RecallFriendsData[] // 可召回好友列表
  receivedBonus: number // 已领取奖励
}

// 团队成员数据
export interface TeamMemberData {
  level: string // 级别
  role: string // 角色
  username: string // 用户名
}

// 邀请好友数据
export interface InviteFriendsData {
  bonus: number // 奖励金额
  done: boolean // 是否完成
  targetCnt: number // 目标数量
}

// 邀请好友奖励
export interface InviteFriendsReward {
  allFriends: number // 总好友
  doneCount: number // 已完成数量
  inviteFriends: InviteFriendsData[] // 奖励列表
  receivedBonus: number // 已领取奖励
  totalBonus: number // 总奖励
}

// 日报请求
export interface DailyProfitRequest {
  date: string // 日期
}

// 日报数据
export interface DailyProfitData {
  eventReward: number // 活动奖励
  inrBuyTimes: number // INR 购入次数
  inrBuyToken: number // INR 购入金额
  inrTradeProfit: number // INR 交易利润
  sellTimes: number // INR 卖出次数
  sellToken: number // INR 卖出金额
  teamProfit: number // 团队利润
  totalProfit: number // 总利润
}

// 团队日报
export interface MbrTeamDaily {
  activityRewardAmt: number // 活动奖励金额
  buyCurrencyAmt: number // 买入法币金额
  buyTimes: number // 买入次数
  buyUsdtAmt: number // USDT金额
  createAt: string // 创建时间
  createBy: string // 创建人
  date: number // 统计日期
  disabled: boolean // 启用状态
  dividendAmt: number // 分红金额
  id: number
  newTeamCount: number // 新增团队会员数
  newWalletAmt: number // 新钱包USDT金额
  paymentShareAmt: number // 支付分红金额
  rewardCurrencyAmt: number // 奖励法币金额
  rewardUsdtAmt: number // 奖励USDT金额
  sellTimes: number // 卖出次数
  sellTokenAmt: number // 卖出代币金额
  uid: string // 会员UID
  updateAt: string // 更新时间
  username: string // 会员名称
}

/**
 * 团队首页信息
 */
export function getTeamHome(): Promise<ApiResponse<TeamHomeData>> {
  return request.post('/team/teamHome.do')
}

/**
 * 邀请充值奖励
 */
export function getRecallFriendsReward(): Promise<ApiResponse<RecallFriendsReward>> {
  const form = new URLSearchParams()
  return request.post('/team/recallFriendsReward.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/**
 * 团队成员列表
 */
export function getTeamMemberList(data: PageRequest): Promise<ApiResponse<PageResponse<TeamMemberData>>> {
  return request.post('/team/memberList.do', data)
}

/**
 * 邀请好友奖励
 */
export function getInviteFriendsReward(): Promise<ApiResponse<InviteFriendsReward>> {
  const form = new URLSearchParams()
  return request.post('/team/inviteFriendsReward.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/**
 * 查询日报
 */
export function getDailyProfit(data: DailyProfitRequest): Promise<ApiResponse<DailyProfitData>> {
  const payload = { date: (data?.date || '').replace(/-/g, '') }
  return request.post('/team/dailyProfit.do', payload)
}

/**
 * 查询1级会员报表
 */
export function getL1Report(data: PageRequest): Promise<ApiResponse<PageResponse<MbrTeamDaily>>> {
  return request.post('/team/l1Report.do', data)
}

/**
 * 查询2级会员报表
 */
export function getL2Report(data: PageRequest): Promise<ApiResponse<PageResponse<MbrTeamDaily>>> {
  return request.post('/team/l2Report.do', data)
}

/**
 * 查询3级会员报表
 */
export function getL3Report(data: PageRequest): Promise<ApiResponse<PageResponse<MbrTeamDaily>>> {
  return request.post('/team/l3Report.do', data)
}
