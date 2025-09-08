import Request from '@/utils/request'
import { Web, WebType } from '@/types/app/web'

// 新增网站
export const addLinkDataAPI = (data: Web) => Request('POST', '/link', { data })

// 删除网站
export const delLinkDataAPI = (id: number) => Request('DELETE', `/link/${id}`)

// 修改网站
export const editLinkDataAPI = (data: Web) => Request('PATCH', '/link', { data })

// 获取网站
export const getLinkDataAPI = (id?: number) => Request<Web>('GET', `/link/${id}`)

// 获取网站列表
export const getLinkListAPI = (data?: QueryData) => Request<Web[]>('POST', `/link/list`, {
    data: { ...data?.query },
})

// 获取网站信息
export const getWebsiteInfoAPI = (url: string) => Request<Web>('GET', `/link/website-info?url=${url}`)

// 分页获取评论列表
export const getLinkPagingAPI = (data?: QueryData) => Request<Paginate<Web[]>>('POST', `/link/paging`, {
    data: { ...data?.query },
    params: {
        ...data?.pagination
    }
})

// 获取网站类型列表
export const getWebTypeListAPI = () => {
    return Request<WebType[]>('GET', `/link/type`);
};

// 审核网站
export const auditWebDataAPI = (id: number) => Request<Web>('PATCH', `/link/audit/${id}`)
