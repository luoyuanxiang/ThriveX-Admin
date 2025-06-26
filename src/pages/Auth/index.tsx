import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authGitHubLoginAPI } from '@/api/Auth'
import { getRolePermissionListAPI } from '@/api/Role';
import { useUserStore } from '@/stores';
import { notification } from 'antd';

export default () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate()
  const store = useUserStore();

  // 获取code参数
  const code = searchParams.get('code');

  const authGitHubLogin = async (code: string) => {
    try {
      const { data } = await authGitHubLoginAPI(code)
      const { data: permission } = await getRolePermissionListAPI(data.role.id as number);

      // 将用户信息和token保存起来
      store.setToken(data.token);
      store.setUser(data.user);
      store.setRole(data.role)
      store.setPermission(permission)

      notification.success({
        message: '🎉 登录成功',
        description: `Hello ${data.user.name} 欢迎回来`,
      });

      navigate('/')
    } catch (error) {
      // 登录失败，重定向到登录页
      navigate('/login')
      // http://localhost:5173/auth?code=8ee96443633cca3aaded
    }
  }

  useEffect(() => {
    if (code) {
      console.log('获取到的code值:', code);
      // 在这里处理code，比如发送到后端进行OAuth认证
      authGitHubLogin(code)
    }
  }, [code]);

  return null
}