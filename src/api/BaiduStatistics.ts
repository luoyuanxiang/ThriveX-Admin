import Request from '@/utils/request'
import { BaiduStatistics } from '@/types/app/baiduStatistics.ts'

export const getBaiduStatisticsAPI = () => Request<BaiduStatistics>("GET", "/baidu/statistics")
export const editBaiduStatisticsAPI = (data: BaiduStatistics) => Request<BaiduStatistics>("PUT", "/baidu/statistics", { data })