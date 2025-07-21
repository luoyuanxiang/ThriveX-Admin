import Request from '@/utils/request'
import { Swiper } from '@/types/app/swiper'

// 新增轮播图
export const addSwiperDataAPI = (data: Swiper) => Request('POST', '/swiper', { data })

// 删除轮播图
export const delSwiperDataAPI = (id: number) => Request('DELETE', `/swiper/${id}`)

// 修改轮播图
export const editSwiperDataAPI = (data: Swiper) => Request('PATCH', '/swiper', { data })

// 获取轮播图
export const getSwiperDataAPI = (id?: number) => Request<Swiper>('GET', `/swiper/${id}`)

// 获取轮播图数据列表
export const getSwiperListAPI = (data?: QueryData) => Request<Swiper[]>('POST', `/swiper/list`, {
    data: { ...data?.query },
})

// 分页获取轮播图列表
export const getSwiperPagingAPI = (data?: QueryData) => Request<Paginate<Swiper[]>>('POST', `/swiper/paging`, {
    data: { ...data?.query },
    params: {
        ...data?.pagination
    }
})