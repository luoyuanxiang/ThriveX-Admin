import Request from '@/utils/request'
import { File, FileDir } from '@/types/app/file'

// 删除文件
export const delFileDataAPI = (filePath: string) => Request('DELETE', `/file?filePath=${filePath}`)

// 获取文件
export const getFileDataAPI = (filePath: string) => Request<File>('GET', `/file/info?filePath=${filePath}`)

// 获取文件列表
export const getFileListAPI = (dir: string, paging?: Page) => Request<Paginate<File[]>>('GET', `/file/list?dir=${dir}`, {
  params: {
    ...paging
  }
})

// 获取目录列表
export const getDirListAPI = () => Request<FileDir[]>('GET', '/file/dir')