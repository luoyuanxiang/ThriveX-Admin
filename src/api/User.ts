import Request from '@/utils/request';
import { EditUser, User, UserInfo } from '@/types/app/user';

// 新增用户
export const addUserDataAPI = (data: User) => Request('POST', '/user', { data });

// 删除用户
export const delUserDataAPI = (id: number) => Request('DELETE', `/user/${id}`);

// 编辑用户
export const editUserDataAPI = (data: UserInfo) => Request('PATCH', '/user', { data });

// 获取用户
export const getUserDataAPI = (id?: number) => Request<User>('GET', `/user/${id}`);

// 获取用户列表
export const getUserListAPI = (data?: QueryData) =>
  Request<User[]>('POST', `/user/list`, {
    data: { ...data?.query },
  });

// 分页获取用户列表
export const getUserPagingAPI = (data?: QueryData) =>
  Request<Paginate<User[]>>('POST', `/user/paging`, {
    data: { ...data?.query },
    params: {
      ...data?.pagination,
    },
  });
// 修改管理员密码
export const editAdminPassAPI = (data: EditUser) => Request('PATCH', '/user/pass', { data });
