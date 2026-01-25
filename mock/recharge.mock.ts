import { defineMock } from 'vite-plugin-mock-dev-server'

// 模拟匹配状态
const matchedAt = 0
let callCount = 0

export default defineMock({
  url: '/r/pay.do',
  method: 'POST',
  body: (request) => {
    callCount++

    // 模拟：前3次调用返回未匹配状态，之后返回已匹配
    const isMatched = callCount > 3

    if (!isMatched) {
      // 未匹配 - ctType 为空
      return {
        code: '200',
        msg: 'success',
        data: {
          amount: '1000',
          ctType: '', // 空表示未匹配
          leftTime: 0,
          orderNo: `ORD${Date.now()}`,
          payAccount: '',
          realName: '',
          retUrl: 'https://example.com/callback',
          stat: '0',
        },
      }
    }

    // 已匹配 - 返回完整支付信息
    return {
      code: '200',
      msg: 'success',
      data: {
        amount: '1000.00',
        ctType: 'UPI',
        leftTime: 300, // 5分钟倒计时
        orderNo: `ORD${Date.now()}`,
        payAccount: 'testuser@upi',
        realName: 'Test User',
        retUrl: 'https://example.com/callback',
        stat: '0',
      },
    }
  },
})
