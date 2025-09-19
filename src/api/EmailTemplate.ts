import Request from '@/utils/request';
import { EmailTemplate } from '@/types/app/emailTemplate';

// 新增足迹
export const addEmailTemplateDataAPI = (data: EmailTemplate) => Request('POST', '/email/template', { data });

// 删除足迹
export const delEmailTemplateDataAPI = (id: number) => Request('DELETE', `/email/template/${id}`);

// 修改足迹
export const editEmailTemplateDataAPI = (data: EmailTemplate) => Request('PUT', '/email/template', { data });

// 获取足迹
export const getEmailTemplateDataAPI = (id?: number) => Request<EmailTemplate>('GET', `/email/template/${id}`);

// 获取足迹列表
export const getEmailTemplateListAPI = () => Request<EmailTemplate[]>('GET', '/email/template/list');

export const sendEmailTemplateAPI = (data: object) => Request('POST', '/email/template/send', { data });
