import Request from '@/utils/request';
import { LoginReturn, Login } from '@/types/app/user';

// 登录
export const loginDataAPI = (data: Login) => Request<LoginReturn>('POST', '/login', { data });

// 判断当前token是否有效
export const checkTokenAPI = (token: string) => Request('GET', `/check?token=${token}`);
