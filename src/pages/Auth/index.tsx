import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authGitHubLoginAPI } from '@/api/Auth'
import { getRolePermissionListAPI } from '@/api/Role';
import { useUserStore } from '@/stores';
import { notification } from 'antd';
import github from '../Login/assets/images/oauth/github.svg';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* GitHub Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src={github} alt="" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">GitHub 授权认证</h1>
          <p className="text-gray-600 text-sm">正在验证您的身份信息...</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>
    </div>
  )
}