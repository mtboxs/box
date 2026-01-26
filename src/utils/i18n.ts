import { createI18n } from 'vue-i18n'
import enUS from 'vant/es/locale/lang/en-US'
import zhCN from 'vant/es/locale/lang/zh-CN'
import thTH from 'vant/es/locale/lang/th-TH'
import { Locale } from 'vant'
import type { PickerColumn } from 'vant'

const FALLBACK_LOCALE = 'en-US'

const vantLocales = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'th-TH': thTH,
}

export const languageColumns: PickerColumn = [
  { text: 'English', value: 'en-US' },
  { text: 'ภาษาไทย', value: 'th-TH' },
  { text: '简体中文', value: 'zh-CN' },
]

export const i18n = setupI18n()
type I18n = typeof i18n

export const locale = computed({
  get() {
    return i18n.global.locale.value
  },
  set(language: string) {
    setLang(language, i18n)
  },
})

function setupI18n() {
  const locale = getI18nLocale()
  const i18n = createI18n({
    locale,
    legacy: false,
  })
  setLang(locale, i18n)
  return i18n
}

async function setLang(lang: string, i18n: I18n) {
  await loadLocaleMsg(lang, i18n)

  document.querySelector('html').setAttribute('lang', lang)
  localStorage.setItem('language', lang)
  i18n.global.locale.value = lang

  // 设置 vant 组件语言包
  Locale.use(lang, vantLocales[lang])
}

// 加载本地语言包
async function loadLocaleMsg(locale: string, i18n: I18n) {
  const messages = await import(`../locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, messages.default)
}

// 获取当前语言对应的语言包名称
function getI18nLocale() {
  const storedLocale = localStorage.getItem('language')

  const langs = languageColumns.map(v => v.value as string)

  const foundLocale = storedLocale && langs.find(v => v === storedLocale || v.indexOf(storedLocale) === 0)

  const locale = foundLocale || FALLBACK_LOCALE

  return locale
}
