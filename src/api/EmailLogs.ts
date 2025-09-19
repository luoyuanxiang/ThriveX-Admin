import Request from '@/utils/request';
import { EmailLogs } from '@/types/app/emailLogs';

// 分页获取文章列表
export const getEmailLogsPagingAPI = (data?: QueryData) =>
  Request<Paginate<EmailLogs[]>>('GET', `/email_logs/paging`, {
  params: {
    ...data?.pagination
  }
})

export const delBatchEmailLogsDataAPI = (ids: number[]) =>
  Request('DELETE', '/email_logs', { data: ids});