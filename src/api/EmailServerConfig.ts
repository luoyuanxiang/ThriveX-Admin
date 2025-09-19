import Request from '@/utils/request'
import { EmailServerConfig } from '@/types/app/emailServerConfig'

// 新增足迹
export const addEmailServerConfigDataAPI = (data: EmailServerConfig) => Request('POST', '/email/config', { data })

// 删除足迹
export const delEmailServerConfigDataAPI = (id: number) => Request('DELETE', `/email/config/${id}`)

// 修改足迹
export const editEmailServerConfigDataAPI = (data: EmailServerConfig) => Request('PUT', '/email/config', { data })
export const setEmailServerConfigDefaultAPI = (id?: number) => Request('PUT', `/email/config/setDefaultConfig/${id}`)

// 获取足迹
export const getEmailServerConfigDataAPI = (id?: number) => Request<EmailServerConfig>('GET', `/email/config/${id}`)

// 获取足迹列表
export const getEmailServerConfigListAPI = (key: string) => Request<EmailServerConfig[]>('GET', '/email/config/list?key=' + key);
export const testEmailServerConfigAPI = (id: number) => Request('POST', `/email/config/test/${id}`);