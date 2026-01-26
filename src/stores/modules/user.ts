import { defineStore } from 'pinia'
import type { MbrLoginRequest, MbeRegisterRequest, MemberContext } from '@/api/user'
import { clearToken, setToken } from '@/utils/auth'
import md5 from 'crypto-js/md5'
import { STORAGE_USER_KEY } from '@/stores/mutation-type'

import {
  getUserInfo,
  login as userLogin,
  logout as userLogout,
  register as userRegister,
} from '@/api/user'

const InitUserInfo: MemberContext = {
  account: '',
  actualName: '',
  balance: 0,
  bankCardNo: '',
  bankName: '',
  banned: false,
  currToken: '',
  id: 0,
  integral: 0,
  inviteCode: '',
  logoNumber: '',
  mbrType: '0',
  nickname: '',
  phone: '',
  root: false,
  status: '0',
  todayEarnings: 0,
  totalRevenue: 0,
  vipLevel: '0',
  username: '',
  uid: '',
  bal: 0,
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<MemberContext>({ ...InitUserInfo })

  // Set user's information
  const setInfo = (partial: Partial<MemberContext>) => {
    // Merge existing info with new partial data
    userInfo.value = { ...userInfo.value, ...partial }
    
    // Map fields to aliases for compatibility with UI components
    userInfo.value.username = userInfo.value.account || userInfo.value.nickname
    userInfo.value.uid = String(userInfo.value.id)
    
    // Ensure balance is number
    const balanceVal = Number(userInfo.value.balance)
    userInfo.value.balance = isNaN(balanceVal) ? 0 : balanceVal
    userInfo.value.bal = userInfo.value.balance

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userInfo.value))
  }

  const login = async (loginForm: MbrLoginRequest) => {
    try {
      const payload = { ...loginForm }
      if (loginForm.password) {
        payload.password = md5(loginForm.password).toString()
      }

      const res = await userLogin(payload)
      if (res.code === '200') {
        // data is string token: "w#43d0fde660914363a514c4b43c6de837"
        setToken(res.data)
        await info() // fetch user info immediately after login
        return true
      }
      // Login failed with error message from server
      throw new Error(res.msg || 'Login failed')
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
    }
    catch (error) {
      // If fetching info fails (e.g. 401), clear token
      // clearToken() 
      // Commented out clearToken to avoid loop if info fails for other reasons, 
      // let auth interceptor handle 401s
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

  const register = async (payload: MbeRegisterRequest) => {
    try {
      const data = { ...payload, loginPassword: md5(payload.loginPassword).toString() }
      const res = await userRegister(data)
      return res
    }
    catch (e) {
      throw e
    }
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
