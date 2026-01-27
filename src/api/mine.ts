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

// Order Response Object
export interface ProductOrderResponse {
  id: number
  mbrId: number
  orderNo: string
  pdNo: string
  productName: string
  productDesc: string
  pic1Url: string
  pic2Url: string
  pic3Url: string
  labelPrice: number
  orderPrice: number
  commission: number
  pdStatus: string // OrderPdStatus: 0,1,2,3,4
  specialOffer: boolean
  vipLevel: string
  phone: string
  disabled: boolean
  createBy: string
  createAt: string
  updateAt: string
}

// Fund Detail (Assets Flow)
export interface MbrAssetsFlw {
  id: number
  mbrId: number
  flwNo: string
  type: string // AssetsFlwType: 0..10
  amount: number
  beforeAmt: number
  afterAmt: number
  relatedId: number
  relatedNo: string
  remark: string
  createBy: string
  createAt: string
}

// Chat Message
export interface ChatMsgLog {
  id: number
  chatId: number
  ownerId: number
  content: string
  imageFlg: boolean
  customerFlg: boolean
  disabled: boolean
  createAt: string
}

// Recharge Record
export interface MbrRechargeRecord {
  id: number
  mbrId: number
  recNo: string
  amount: number
  status: string // RecordStatus: 0,1,2
  memo: string
  disabled: boolean
  createBy: string
  createAt: string
  updateAt: string
}

// Withdraw Record
export interface MbrWithdrawRecord {
  id: number
  mbrId: number
  recNo: string
  amount: number
  status: string // RecordStatus: 0,1,2
  memo: string
  disabled: boolean
  createBy: string
  createAt: string
  updateAt: string
}

// Requests
export interface AvatarUpdRequest {
  avatar: string
}

export interface PasswordUpdRequest {
  newPassword: string
  oldPassword?: string
}

export interface BankInfoSaveRequest {
  actualName: string
  bankCardNo: string
  bankName: string
  withdrawPassword: string
}

export interface MsgContentRequest {
  chatId: number
  content: string
}

export interface BaseUpdateRequest {
  id: number
}

/**
 * Get Await Pay Orders (待付款)
 */
export function getAwaitPayOrders(data: PageRequest): Promise<ApiResponse<PageResponse<ProductOrderResponse>>> {
  return request.post('/mine/awaitPayOrder.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Get Completed Orders (已完成)
 */
export function getCompletedOrders(data: PageRequest): Promise<ApiResponse<PageResponse<ProductOrderResponse>>> {
  return request.post('/mine/completedOrder.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Get Fund Details (资金明细)
 */
export function getFundDetails(data: PageRequest): Promise<ApiResponse<PageResponse<MbrAssetsFlw>>> {
  return request.post('/mine/fundDetails.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Get Chat Messages (聊天记录)
 */
export function getMessages(data: BaseUpdateRequest): Promise<ApiResponse<ChatMsgLog[]>> {
  return request.post('/mine/getMessage.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Send Message (发送消息)
 */
export function sendMessage(data: MsgContentRequest): Promise<ApiResponse<void>> {
  return request.post('/mine/sendMessage.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Modify Avatar (修改头像)
 */
export function modifyAvatar(data: AvatarUpdRequest): Promise<ApiResponse<void>> {
  return request.post('/mine/modifyAvatar.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Modify Login Password (修改登录密码)
 */
export function modifyLoginPassword(data: PasswordUpdRequest): Promise<ApiResponse<void>> {
  return request.post('/mine/modifyLoginPassword.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Modify Withdraw Password (修改提现密码)
 */
export function modifyWithdrawPassword(data: PasswordUpdRequest): Promise<ApiResponse<void>> {
  return request.post('/mine/modifyWithdrawPassword.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Get Recharge Records (充值记录)
 */
export function getRechargeRecords(data: PageRequest): Promise<ApiResponse<PageResponse<MbrRechargeRecord>>> {
  return request.post('/mine/rechargeRecord.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Get Withdraw Records (提现记录)
 */
export function getWithdrawRecords(data: PageRequest): Promise<ApiResponse<PageResponse<MbrWithdrawRecord>>> {
  return request.post('/mine/withdrawRecord.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Get Repurchase Orders (待回购订单)
 */
export function getRepurchaseOrders(data: PageRequest): Promise<ApiResponse<PageResponse<ProductOrderResponse>>> {
  return request.post('/mine/repurchaseOrder.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Get Repurchased Orders (已回购订单)
 */
export function getRepurchasedOrders(data: PageRequest): Promise<ApiResponse<PageResponse<ProductOrderResponse>>> {
  return request.post('/mine/repurchasedOrder.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Submit Repurchase (申请回购)
 */
export function submitRepurchase(data: BaseUpdateRequest): Promise<ApiResponse<void>> {
  return request.post('/mine/repurchaseSubmit.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Pay Order (订单付款)
 */
export function payOrder(data: BaseUpdateRequest): Promise<ApiResponse<void>> {
  return request.post('/mine/payOrder.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Save Bank Info (修改银行卡信息)
 */
export function saveBankInfo(data: BankInfoSaveRequest): Promise<ApiResponse<void>> {
  return request.post('/mine/saveBankInfo.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

// --- Legacy/Placeholder Functions for Build Compatibility ---

export function getDailyBuyReward(): Promise<ApiResponse<any>> {
  return Promise.resolve({ code: '200', data: {}, msg: 'Success' })
}

export function getLinkUpiReward(): Promise<ApiResponse<any>> {
  return Promise.resolve({ code: '200', data: {}, msg: 'Success' })
}

export function getNewbieReward(): Promise<ApiResponse<any>> {
  return Promise.resolve({ code: '200', data: {}, msg: 'Success' })
}

export function updatePassword(data: any): Promise<ApiResponse<void>> {
  return modifyLoginPassword(data)
}

export interface DailyBuyInrRewardInfo {
  [key: string]: any
}
export interface LinkUpiRewardInfo {
  [key: string]: any
}
export interface NewbieRewardInfo {
  [key: string]: any
}

export function updateSellLimit(_data: any): Promise<ApiResponse<void>> {
  return Promise.resolve({ code: '200', data: undefined, msg: 'Success' })
}
