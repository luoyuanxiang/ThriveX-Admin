import Request from '@/utils/request'
import { Footprint } from '@/types/app/footprint'

// 新增足迹
export const addFootprintDataAPI = (data: Footprint) => Request('POST', '/footprint', { data })

// 删除足迹
export const delFootprintDataAPI = (id: number) => Request('DELETE', `/footprint/${id}`)

// 修改足迹
export const editFootprintDataAPI = (data: Footprint) => Request('PATCH', '/footprint', { data })

// 获取足迹
export const getFootprintDataAPI = (id?: number) => Request<Footprint>('GET', `/footprint/${id}`)

// 获取足迹列表
export const getFootprintListAPI = (data?: QueryData) => Request<Footprint[]>('POST', '/footprint/list', {
    data: { ...data?.query }
});