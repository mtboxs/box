import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { showNotify } from 'vant'
import { STORAGE_LANG_KEY } from '@/stores/mutation-type'
import { i18n } from '@/utils/i18n'
import { getToken } from '@/utils/auth'

export const REQUEST_TOKEN_KEY = 'Access-Token'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 6000,
})

export type RequestError = AxiosError<{
  message?: string
  result?: any
  errorMessage?: string
}>

function errorHandler(error: RequestError): Promise<any> {
  if (error.response) {
    const { data = {}, status, statusText } = error.response
    if (status === 403) {
      showNotify({
        type: 'danger',
        message: (data && data.message) || statusText,
      })
    }
    if (status === 401 && data.result && data.result.isLogin) {
      showNotify({
        type: 'danger',
        message: 'Authorization verification failed',
      })
    }
  }
  return Promise.reject(error)
}

function requestHandler(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> {
  const savedToken = getToken()
  const lang = localStorage.getItem(STORAGE_LANG_KEY) || 'zh-CN'
  if (savedToken) {
    config.headers[REQUEST_TOKEN_KEY] = savedToken
    config.headers.Authorization = savedToken
  }
  config.headers['Accept-Language'] = lang
  if (import.meta.env.VITE_APP_PREVIEW)
    console.warn('[API]', (config.method || 'GET').toUpperCase(), config.url)
  return config
}

request.interceptors.request.use(requestHandler, errorHandler)

function responseHandler(response: { data: any }) {
  const res = response.data
  if (res && typeof res === 'object' && res.code) {
    const translated = res.msg ? i18n.global.t(res.msg) : ''
    if (res.code !== '200' && translated) {
      showNotify({ type: 'warning', message: translated })
    }
  }
  return res
}

request.interceptors.response.use(responseHandler, errorHandler)

export default request
