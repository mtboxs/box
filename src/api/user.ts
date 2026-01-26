import request from '@/utils/request'

export interface ApiResponse<T> {
  code: string
  data: T
  msg: string
}

export interface MbrLoginRequest {
  password?: string
  phone?: string
}

export interface MbeRegisterRequest {
  inviteCode: string
  loginPassword: string
  nickname: string
  phone: string
}

export interface MemberContext {
  account: string
  actualName: string
  balance: number
  bankCardNo: string
  bankName: string
  banned: boolean
  currToken: string
  id: number
  integral: number
  inviteCode: string
  logoNumber: string
  mbrType: string // 0,1,2
  nickname: string
  phone: string
  root: boolean
  status: string // 0,1
  todayEarnings: number
  totalRevenue: number
  vipLevel: string // 0..8
  // Aliases for compatibility if needed, but better to use new fields
  username?: string // mapped to account or nickname
  uid?: string // mapped to id
  bal?: number // mapped to balance
}

/**
 * Login
 */
export function login(data: MbrLoginRequest): Promise<ApiResponse<string>> {
  return request.post('/pub/login.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Register
 */
export function register(data: MbeRegisterRequest): Promise<ApiResponse<string>> {
  return request.post('/pub/register.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Get User Info
 */
export function getUserInfo(): Promise<ApiResponse<MemberContext>> {
  // Assuming /pub/info.do is correct based on user input, 
  // previously it was /pub/userinfo.do. User explicitly said /pub/info.do
  const form = new URLSearchParams()
  return request.post('/pub/info.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/**
 * Logout
 */
export function logout(): Promise<ApiResponse<void>> {
  const form = new URLSearchParams()
  return request.post('/pub/logout.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

// --- Legacy/Placeholder Functions for Build Compatibility ---

export function sendOtp(_data?: any): Promise<ApiResponse<void>> {
  return Promise.resolve({ code: '200', data: undefined, msg: 'OTP sent' })
}
