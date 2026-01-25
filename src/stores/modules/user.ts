import { defineStore } from 'pinia'
import type { LoginData, MbrContext } from '@/api/user'
import { clearToken, setToken } from '@/utils/auth'
import md5 from 'crypto-js/md5'
import { STORAGE_USER_KEY } from '@/stores/mutation-type'

import {
  getUserInfo,
  login as userLogin,
  logout as userLogout,
  register as userRegister,
} from '@/api/user'

const InitUserInfo: MbrContext = {
  uid: '',
  username: '',
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<MbrContext>({ ...InitUserInfo })

  // Set user's information
  const setInfo = (partial: Partial<MbrContext>) => {
    userInfo.value = { ...partial }
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userInfo.value))
  }

  const login = async (loginForm: LoginData) => {
    try {
      const payload = { ...loginForm, password: md5(loginForm.password).toString() }
      const { data, code } = await userLogin(payload)
      if (code === '200') {
        setToken(data as unknown as string)
        const infoRes = await getUserInfo()
        if (infoRes.code === '200') {
          setInfo(infoRes.data)
        }
      }
      else {
        throw new Error('login failed')
      }
    }
    catch (error) {
      clearToken()
      throw error
    }
  }

  const info = async () => {
    try {
      const { data, code } = await getUserInfo()
      if (code === '200') {
        setInfo(data)
      }
      else {
        throw new Error('userinfo failed')
      }
    }
    catch (error) {
      clearToken()
      throw error
    }
  }

  const logout = async () => {
    try {
      await userLogout()
    }
    finally {
      clearToken()
      setInfo({ ...InitUserInfo })
    }
  }

  const register = async (payload: { inviteCode: string, phone: string, password: string }) => {
    try {
      const data = { ...payload, password: md5(payload.password).toString() }
      const res = await userRegister(data)
      return res
    }
    catch {}
  }

  return {
    userInfo,
    info,
    login,
    logout,
    register,
  }
}, {
  persist: true,
})

export default useUserStore
