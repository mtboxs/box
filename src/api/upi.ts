import request from '@/utils/request'

export interface ApiResponse<T> {
  code: string
  data: T
  msg: string
}

export interface MbrUpiSaveRequest {
  ctType: string
  realName: string
  upiNo: string
  otp: string
}

export interface BaseUpdateRequest {
  id: number
}

export interface MbrUpi {
  id: number
  account: string
  allocationQuota: number
  balance: number
  createAt: string
  createBy: string
  ctType: string
  disabled: boolean
  lastDisAt: string
  lastLockedAt: string
  lastSyncAt: string
  linkStatus: string
  locked: boolean
  matched: boolean
  minSingleTransaction: number
  realName: string
  receiving: boolean
  uid: string
  updateAt: string
  upiNo: string
  user: string
  userActive: boolean
  userSell: boolean
  userToken: number
}

export interface MchBankCfg {
  id: number
  createAt: string
  createBy: string
  ctType: string
  disabled: boolean
  merchantId: number
  operateType: string
  receiveDailyLimit: number
  receiveTimeGap: number
  updateAt: string
}

export interface MbrPayInOrder {
  id: number
  bindSource: string
  boundStatus: boolean
  callbackStatus: string
  callbackUrl: string
  cliCode: string
  cliOrderNo: string
  createAt: string
  createBy: string
  ctType: string
  disabled: boolean
  finishedAt: string
  memo: string
  merchantId: number
  orderAmt: number
  orderNo: string
  payTaskStatus: string
  picUrl: string
  realName: string
  releaseStatus: boolean
  retUrl: string
  retryCount: number
  tgNotify: boolean
  uid: string
  updateAt: string
  upiNo: string
  userToken: number
  username: string
  utrNo: string
  utrSource: string
}

/**
 * 新增 UPI
 */
export function addUpi(data: MbrUpiSaveRequest): Promise<ApiResponse<any>> {
  return request.post('/upi/add.do', data)
}

/**
 * 最后10条交易记录
 */
export function getLatest10(data: BaseUpdateRequest): Promise<ApiResponse<MbrPayInOrder[]>> {
  return request.post('/upi/latest10.do', data)
}

/**
 * UPI列表
 */
export function getUpiList(): Promise<ApiResponse<MbrUpi[]>> {
  const form = new URLSearchParams()
  return request.post('/upi/list.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/**
 * 银行选项
 */
export function getBankOpts(): Promise<ApiResponse<MchBankCfg[]>> {
  const form = new URLSearchParams()
  return request.post('/upi/opts.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/**
 * reLink
 */
export interface OtpUpdateRequest {
  id: number
  otp: string
}

export function reLink(data: OtpUpdateRequest): Promise<ApiResponse<any>> {
  return request.post('/upi/reLink.do', data)
}

/**
 * 切换出售状态
 */
export function switchSell(data: BaseUpdateRequest): Promise<ApiResponse<any>> {
  return request.post('/upi/switchSell.do', data)
}
