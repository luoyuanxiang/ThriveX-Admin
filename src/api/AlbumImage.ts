import Request from '@/utils/request'
import { AlbumImage } from '@/types/app/album'

// 新增照片
export const addAlbumImageDataAPI = (data: AlbumImage) => Request('POST', '/album/image', { data })

// 删除照片
export const delAlbumImageDataAPI = (id: number) => Request('DELETE', `/album/image/${id}`)

// 修改照片
export const editAlbumImageDataAPI = (data: AlbumImage) => Request('PATCH', '/album/image', { data })

// 获取照片
export const getAlbumImageDataAPI = (id?: number) => Request<AlbumImage>('GET', `/album/image/${id}`)

// 获取照片列表
export const getAlbumImageListAPI = (data?: QueryData) => Request<AlbumImage[]>('POST', '/album/image/list', {
  data: { ...data?.query }
});

// 分页获取照片列表
export const getAlbumImagePagingAPI = (data?: QueryData) => Request<Paginate<AlbumImage[]>>('POST', `/album/image/paging`, {
  data: { ...data?.query },
  params: {
    ...data?.pagination
  }
})