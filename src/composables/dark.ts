export const isDark = useDark({
  initialValue: 'light',
  storageKey: 'theme',
})
export const toggleDark = useToggle(isDark)
export const preferredDark = usePreferredDark()
