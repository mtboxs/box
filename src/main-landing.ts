import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import AppLanding from '@/AppLanding.vue'
import router from '@/router/landing'
import 'virtual:uno.css'
import '@/styles/app.less'
import '@/styles/var.less'
import { i18n } from '@/utils/i18n'

import '@vant/touch-emulator'
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/image-preview/style'

const app = createApp(AppLanding)
const head = createHead()

app.use(head)
app.use(router)
app.use(i18n)

app.mount('#app')
