import request from '@/utils/request'

export interface ApiResponse<T> {
  code: string
  data: T
  msg: string
}

export interface MchOperateParamVal {
  createAt?: string
  createBy?: string
  disabled?: boolean
  id?: number
  merchantId?: number
  operateParamId?: number
  paramKey?: string
  paramName?: string
  paramValue?: string
  updateAt?: string
}

export interface MchPicResources {
  code?: string
  createAt?: string
  createBy?: string
  disabled?: boolean
  id?: number
  merchantId?: number
  name?: string
  remark?: string
  resourceType?: string
  sortNo?: number
  srcUrl?: string
  updateAt?: string
}

export interface MchRichText {
  code?: string
  content?: string
  coverImg?: string
  createAt?: string
  createBy?: string
  disabled?: boolean
  id?: number
  merchantId?: number
  name?: string
  resourceType?: string
  sortNo?: number
  updateAt?: string
}

export interface HomeInfo {
  configs: MchOperateParamVal[]
  picResources: MchPicResources[]
  richTexts: MchRichText[]
}

export function getHomeInfo(): Promise<ApiResponse<HomeInfo>> {
  const form = new URLSearchParams()
  return request.post('/home/homeInfo.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function readNotify(id: number): Promise<ApiResponse<null>> {
  return request.post('/home/readNotify.do', { id }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getUnReadNotify(): Promise<ApiResponse<MchRichText[]>> {
  const form = new URLSearchParams()
  return request.post('/home/unReadNotify.do', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
