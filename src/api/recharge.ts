import request from '@/utils/request'

export interface ApiResponse<T> {
  code: string
  data: T
  msg: string
}

export interface RechargePayRequest {
  no: string
}

export interface RechargePayResponse {
  amount: string
  ctType: string
  leftTime: number
  orderNo: string
  payAccount: string
  realName: string
  retUrl: string
  stat: string
}

/**
 * 充值支付查询
 * @param data 平台订单号
 */
export function getPayInfo(data: RechargePayRequest): Promise<ApiResponse<RechargePayResponse>> {
  return request.post('/r/pay.do', data)
}
