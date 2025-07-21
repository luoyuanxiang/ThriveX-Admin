import Request from '@/utils/request'
import { Record } from '@/types/app/record'

// 新增说说
export const addRecordDataAPI = (data: Record) => Request('POST', '/record', { data })

// 删除说说
export const delRecordDataAPI = (id: number) => Request('DELETE', `/record/${id}`)

// 修改说说
export const editRecordDataAPI = (data: Record) => Request('PATCH', '/record', { data })

// 获取说说
export const getRecordDataAPI = (id?: number) => Request<Record>('GET', `/record/${id}`)

// 获取说说列表
export const getRecordListAPI = (data?: QueryData) => Request<Record[]>('POST', `/record/list`, {
    data: { ...data?.query },
})

// 分页获取说说列表
export const getRecordPagingAPI = (data?: QueryData) => Request<Paginate<Record[]>>('POST', `/record/paging`, {
    data: { ...data?.query },
    params: {
        ...data?.pagination
    }
})