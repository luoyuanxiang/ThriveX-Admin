import Request from '@/utils/request'
import { EnvConfig, EnvConfigName } from '@/types/app/config'

// 获取网站配置
export const getWebConfigDataAPI = <T>(type: string) => Request<T>("GET", `/web_config/list/${type}`)

// 修改网站配置
export const editWebConfigDataAPI = (type: string, data: object) => Request<{ [string: string]: string }>("PATCH", `/web_config/${type}`, { data })


// 获取环境配置
export const getEnvConfigDataAPI = (name: EnvConfigName) => Request<EnvConfig>("GET", `/env_config/name/${name}`)

// 获取环境配置列表
export const getEnvConfigListAPI = () => Request<EnvConfig[]>("GET", `/env_config/list`)

// 更新环境配置
export const updateEnvConfigDataAPI = (data: EnvConfig) => Request("PATCH", `/env_config/${data.id}/json`, { data: data.value })