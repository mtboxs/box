import request from '@/utils/request'

export interface ApiResponse<T> {
  code: string
  data: T
  msg: string
}

export interface BrandInfo {
  id: number
  brandName: string
  brandLogoUrl: string
  brandSort: number
  disabled: boolean
  createBy: string
  createAt: string
  updateAt: string
}

export interface ProductInfo {
  id: number
  brandId: number
  productName: string
  productDesc: string
  pic1Url: string
  pic2Url: string
  pic3Url: string
  labelPrice: number
  orderPrice: number
  commission: number
  orderNo: string
  specialOffer: boolean
  disabled: boolean
  createBy: string
  createAt: string
  updateAt: string
  msg?: string
}

export interface HomeDataResponse {
  brands: BrandInfo[]
  products: ProductInfo[]
}

export interface NoticeRecord {
  id: number
  mbrId: number
  langType: string
  richTxt: string
  disabled: boolean
  createBy: string
  createAt: string
  updateAt: string
}

export interface LangTypeOnlyRequest {
  langType: string
}

/**
 * Get Home Page Data (Brands, Products)
 */
export function getHomeData(): Promise<ApiResponse<HomeDataResponse>> {
  return request.post('/home/data.do', {}, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/**
 * System Grabbing / Order Matching
 */
export function grabbingOrder(): Promise<ApiResponse<ProductInfo>> {
  return request.post('/home/grabbing.do', {}, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/**
 * Get Website Notice
 */
export function getNotice(data: LangTypeOnlyRequest): Promise<ApiResponse<NoticeRecord>> {
  return request.post('/home/notice.do', data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

// --- Deprecated / Legacy Support (to prevent build errors in other pages) ---

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
  // Return empty data to satisfy type checker but indicate it's not used
  return Promise.resolve({
    code: '200',
    data: { configs: [], picResources: [], richTexts: [] },
    msg: 'Deprecated'
  })
}

export function readNotify(id: number): Promise<ApiResponse<null>> {
  return Promise.resolve({ code: '200', data: null, msg: 'Deprecated' })
}

export function getUnReadNotify(): Promise<ApiResponse<MchRichText[]>> {
  return Promise.resolve({ code: '200', data: [], msg: 'Deprecated' })
}
