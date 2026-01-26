import request from '@/utils/request'

export interface ApiResponse<T> {
  code: string
  data: T
  msg: string
}

/**
 * Upload Image
 * @param formData FormData with file
 * @returns image URL
 */
export function uploadImage(formData: FormData): Promise<ApiResponse<string>> {
  return request.post('/pub/upload.do', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
