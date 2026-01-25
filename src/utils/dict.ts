import { i18n } from '@/utils/i18n'

export type DictName
  = | 'NotifyTemplateType'
    | 'UTRSource'
    | 'CliOrderStatus'
    | 'DirType'
    | 'RoleType'
    | 'PayTaskStatus'
    | 'CtxScope'
    | 'PayMode'
    | 'OptionsType'
    | 'BalanceFlwType'
    | 'MenuScope'
    | 'TokenDirection'
    | 'RptType'
    | 'BalanceType'
    | 'CallbackStatus'
    | 'OperateType'
    | 'RecordStatus'
    | 'LinkStatus'
    | 'ConnectStatus'
    | 'NotifyStatus'
    | 'ExecuteType'
    | 'TokenFlwType'
    | 'ResourceType'
    | 'ParamType'
    | 'PermMenuGroup'
    | 'MemberType'
    | 'SyncRes'
    | 'BindSource'
    | 'SyncSourceType'

const dictValues: Record<DictName, number[]> = {
  NotifyTemplateType: [0, 1, 2, 3, 4, 5],
  UTRSource: [0, 1, 2, 3, 4],
  CliOrderStatus: [0, 1, 2, 3, 4, 5, 6],
  DirType: [0, 1, 2],
  RoleType: [0, 1, 2, 3, 4],
  PayTaskStatus: [0, 1, 2, 3, 4, 5],
  CtxScope: [0, 1, 2],
  PayMode: [0, 1, 2, 3],
  OptionsType: [0, 1, 2, 3],
  BalanceFlwType: [0, 1, 2, 3, 4, 5, 6, 7],
  MenuScope: [0, 1, 2],
  TokenDirection: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  RptType: [0, 1, 2],
  BalanceType: [0, 1],
  CallbackStatus: [0, 1, 2, 3],
  OperateType: [0, 1, 2, 3],
  RecordStatus: [0, 1, 2],
  LinkStatus: [0, 1, 2, 3, 4, 5, 6, 7],
  ConnectStatus: [0, 1],
  NotifyStatus: [0, 1, 2, 3],
  ExecuteType: [0, 1, 2, 3, 4, 5],
  TokenFlwType: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
  ResourceType: [0, 1, 2, 3, 4],
  ParamType: [0, 1, 2, 3, 4, 5],
  PermMenuGroup: [0, 1, 2, 3, 4, 5],
  MemberType: [0, 1],
  SyncRes: [0, 1],
  BindSource: [0, 1, 2, 3, 4],
  SyncSourceType: [0, 1, 2, 3, 4, 5],
}

export function dictLabel(dict: DictName, value: number | string): string {
  const num = typeof value === 'string' ? Number(value) : value
  const key = `dict.${dict}.${num}`
  return i18n.global.t(key)
}

export function dictItems(dict: DictName): { value: number, label: string }[] {
  return dictValues[dict].map(v => ({ value: v, label: dictLabel(dict, v) }))
}
