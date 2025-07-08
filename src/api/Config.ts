import Request from '@/utils/request'
import { Config, EnvConfigName } from '@/types/app/config'

// 获取网站配置
export const getWebConfigDataAPI = <T>(type: string) => Request<T>("GET", `/web_config/list/${type}`)

// 修改网站配置
export const editWebConfigDataAPI = (type: string, data: object) => Request<{ [string: string]: string }>("PATCH", `/web_config/${type}`, { data })


// 获取环境配置
export const getEnvConfigDataAPI = (name: EnvConfigName) => Request<Config>("GET", `/env_config/name/${name}`)

// 获取环境配置列表
export const getEnvConfigListAPI = () => Request<Config[]>("GET", `/env_config/list`)

// 更新环境配置
export const updateEnvConfigDataAPI = (data: Config) => Request("PATCH", `/env_config/json/${data.id}`, { data: data.value })


// 获取页面配置
export const getPageConfigDataAPI = (id: number) => Request<Config>("GET", `/page_config/${id}`)

// 获取页面配置列表
export const getPageConfigListAPI = () => Request<Config[]>("GET", `/page_config/list`)

// 更新页面配置
export const updatePageConfigDataAPI = (id: number, data: object) => Request("PATCH", `/page_config/json/${id}`, { data })