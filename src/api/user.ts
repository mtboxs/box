import request from '@/utils/request'

export interface ApiResponse<T> {
  code: string
  data: T
  msg: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  inviteCode: string
  password: string
  phone: string
}

export interface MbrContext {
  agentUsername?: string
  bal?: number
  banned?: boolean
  frozenBal?: number
  inPayAmount?: number
  inviteCode?: string
  isFinishNewbieActivity?: boolean
  memberType?: string
  minSellToken?: number
  operateType?: string
  parentUsername?: string
  payerRewardFixed?: number
  payerRewardRatio?: number
  root?: boolean
  trc20Address?: string
  uid?: string
  username?: string
}

export function login(data: LoginData): Promise<ApiResponse<string>> {
  return request.post('/pub/login.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function register(data: RegisterData): Promise<ApiResponse<null>> {
  return request.post('/pub/register.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getUserInfo(): Promise<ApiResponse<MbrContext>> {
  const form = new URLSearchParams()
  return request.post('/pub/userinfo.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function logout(): Promise<ApiResponse<null>> {
  const form = new URLSearchParams()
  return request.post('/pub/logout.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function sendOtp(): Promise<ApiResponse<any>> {
  const form = new URLSearchParams()
  return request.post('/pub/sendOtp.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
