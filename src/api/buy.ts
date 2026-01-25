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

// 出售首页统计
export interface SellHomeInfo {
  inActive: number
  inTransaction: number
  todayDeal: number
  todaySuccess: number
  todayTimes: number
}

// 购买订单请求
export interface BuyOrderRequest {
  amount: number
  ctType: string
  orderNo: string
}

// 提交流水号请求
export interface BuyOrderUtrNoRequest {
  taskNo: string
  utrNo: string
}

// 上传凭证请求
export interface BuyOrderUploadRequest {
  taskNo: string
  picUrl: string
}

// 获取提现订单请求
export interface CliWithdrawOrderRequest {
  desc: boolean
  limit: number
  maxAmount: number
  minAmount: number
}

// 会员出金任务
export interface MbrPayOutTask {
  id: number
  createAt: string
  updateAt: string
  disabled: boolean
  createBy: string
  merchantId: number
  uid: string
  ctType: string
  taskNo: string
  taskAmt: number
  payTaskStatus: string
  finishedAt: string
  picUrl: string
  utrNo: string
  utrSource: string
  userToken: number
  username: string
  withdrawOrderNo: string
  withdrawTotalAmt: number
  rewardCode: string
  settled: boolean
  tgNotify: boolean
}

// 会员入金订单
export interface MbrPayInOrder {
  id: number
  createAt: string
  updateAt: string
  disabled: boolean
  createBy: string
  merchantId: number
  uid: string
  ctType: string
  orderNo: string
  cliCode: string
  cliOrderNo: string
  orderAmt: number
  payTaskStatus: string
  finishedAt: string
  picUrl: string
  utrNo: string
  utrSource: string
  bindSource: string
  boundStatus: boolean
  releaseStatus: boolean
  userToken: number
  username: string
  upiNo: string
  realName: string
  callbackStatus: string
  callbackUrl: string
  retUrl: string
  retryCount: number
  memo: string
  tgNotify: boolean
  rewardAmt?: number
  rewardFixedAmt?: number
}

// USDT 购买记录
export interface MbrUsdtBuyRecord {
  id: number
  createAt: string
  updateAt: string
  disabled: boolean
  createBy: string
  merchantId: number
  uid: string
  quantity: number
  receiveTokenAmt: number
  txHash: string
}

// 客户提现订单
export interface CliWithdrawOrder {
  id: number
  createAt: string
  updateAt: string
  disabled: boolean
  createBy: string
  merchantId: number
  cliCode: string
  cliOrderNo: string
  orderNo: string
  orderAmt: number
  leftAmt?: number | string
  finishedAmt: number
  minSplitAmt: number
  splitCount: number
  status: string
  completedAt: string
  upiAccount: string
  realName: string
  callbackStatus: string
  callbackUrl: string
  retryCount: number
  memo: string
  tgNotify: boolean
  rewardAmt?: number
  rewardFixedAmt?: number
}

/**
 * INR 取消记录
 */
export function getInrCancelHistory(data: PageRequest): Promise<ApiResponse<PageResponse<MbrPayOutTask>>> {
  return request.post('/buy/inrCancelHistory.do', data)
}

/**
 * INR 锁定记录
 */
export function getInrLockHistory(data: PageRequest): Promise<ApiResponse<PageResponse<MbrPayOutTask>>> {
  return request.post('/buy/inrLockHistory.do', data)
}

/**
 * INR 购买记录
 */
export function getInrHistory(data: PageRequest): Promise<ApiResponse<PageResponse<MbrPayOutTask>>> {
  return request.post('/buy/inrHistory.do', data)
}

/**
 * 出售记录
 */
export function getSellHistory(data: PageRequest & { payTaskStatus?: string }): Promise<ApiResponse<PageResponse<MbrPayInOrder>>> {
  return request.post('/buy/sellHistory.do', data)
}

/**
 * 提交订单购买
 */
export function submitBuy(data: BuyOrderRequest): Promise<ApiResponse<void>> {
  return request.post('/buy/submitBuy.do', data)
}

/**
 * 提交流水单号
 */
export function submitUtrNo(data: BuyOrderUtrNoRequest): Promise<ApiResponse<void>> {
  return request.post('/buy/submitUtrNo.do', data)
}

/**
 * 上传购买凭证
 */
export function uploadConfirm(data: BuyOrderUploadRequest): Promise<ApiResponse<void>> {
  return request.post('/buy/uploadConfirm.do', data)
}

/**
 * USDT 购买记录
 */
export function getUsdtHistory(data: PageRequest): Promise<ApiResponse<PageResponse<MbrUsdtBuyRecord>>> {
  return request.post('/buy/usdtHistory.do', data)
}

/**
 * 出售首页
 */
export function getSellHome(): Promise<ApiResponse<SellHomeInfo>> {
  const form = new URLSearchParams()
  return request.post('/buy/sellHome.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/**
 * 获取提现订单
 * 注意：后端返回可能是单个对象或数组，前端需统一处理
 */
export async function getWithdrawOrder(data: CliWithdrawOrderRequest): Promise<ApiResponse<CliWithdrawOrder[]>> {
  const res: ApiResponse<CliWithdrawOrder | CliWithdrawOrder[]> = await request.post('/buy/withdrawOrder.do', data)
  // 统一转换为数组格式
  if (res.code === '200' && res.data) {
    res.data = Array.isArray(res.data) ? res.data : [res.data]
  }
  else {
    res.data = []
  }
  return res as ApiResponse<CliWithdrawOrder[]>
}
