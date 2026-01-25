import { i18n } from '@/utils/i18n'

export default function setPageTitle(name?: string): void {
  const appName = i18n.global.t('app.name')
  if (!name) {
    window.document.title = appName
    return
  }
  const key = `navbar.${name}`
  const title = i18n.global.t(key)
  // 如果翻译不存在（返回 key 本身），使用 app 名称
  window.document.title = title === key ? appName : title
}
