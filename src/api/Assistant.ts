import Request from '@/utils/request'
import { Assistant } from '@/types/app/assistant'

// 新增助手
export const addAssistantDataAPI = (data: Assistant) => Request('POST', '/assistant', { data })

// 删除助手
export const delAssistantDataAPI = (id: number) => Request('DELETE', `/assistant/${id}`)

// 修改助手
export const editAssistantDataAPI = (data: Assistant) => Request('PATCH', '/assistant', { data })

// 获取助手
export const getAssistantDataAPI = (id?: number) => Request<Assistant>('GET', `/assistant/${id}`)

// 获取助手列表
export const getAssistantListAPI = (data?: QueryData) => Request<Assistant[]>('POST', '/assistant/list', {
    data: { ...data?.query }
});

// 设置默认助手
export const setDefaultAssistantAPI = (id: number) => Request('PATCH', `/assistant/default/${id}`)