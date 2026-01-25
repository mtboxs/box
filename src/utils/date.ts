import dayjs from 'dayjs'

export function formatTime(val: string | number | undefined, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!val)
    return '-'
  return dayjs(Number(val)).format(format)
}

export function formatDate(val: string | number | undefined, format = 'YYYY-MM-DD') {
  if (!val)
    return '-'
  return dayjs(Number(val)).format(format)
}
