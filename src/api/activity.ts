import request from '@/utils/request'

export interface ApiResponse<T> {
  code: string
  data: T
  msg: string
}

/**
 * Apply/Join Activity
 */
export function joinActivity(): Promise<ApiResponse<void>> {
  return request.post('/activity/activityRequest.do', {}, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
