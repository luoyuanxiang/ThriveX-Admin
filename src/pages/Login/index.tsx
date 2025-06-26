import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'antd/es/form/Form';
import { Button, Form, Input, notification, Divider } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined, GithubOutlined } from '@ant-design/icons';
import { loginDataAPI } from '@/api/User';
import { useUserStore } from '@/stores';
import { getRolePermissionListAPI } from '@/api/Role';
import github from './assets/images/oauth/github.svg';

export default () => {
    const navigate = useNavigate();
    const location = useLocation();
    const store = useUserStore();

    const [loading, setLoading] = useState(false)

    const client_id = 'Ov23liIIzRjNDsB1PXsk';

    const authorize_uri = 'https://github.com/login/oauth/authorize';
    const redirect_uri = `${window.location.origin}/auth`;

    const [form] = useForm();

    const [isPassVisible, setIsPassVisible] = useState(false);
    const returnUrl = new URLSearchParams(location.search).get('returnUrl') || '/';

    const onSubmit = async () => {
        try {
            setLoading(true)

            const values = await form.validateFields();
            const { data } = await loginDataAPI(values);
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

            setLoading(false)
            navigate(returnUrl);
        } catch (error) {
            setLoading(false)
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-20 blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* 主登录卡片 */}
                <div className="bg-[rgba(255,255,255,0.5)] backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                    {/* 头部区域 */}
                    <div className='flex justify-center space-x-4 mb-8'>
                        <img src="/logo.png" alt="" className='w-12 h-12' />
                        <div className='flex flex-col'>
                            <h1 className='font-bold text-lg text-slate-700'>ThriveX</h1>
                            <p className="text-slate-400 text-sm">现代化博客管理系统</p>
                        </div>
                    </div>

                    {/* 登录表单 */}
                    <Form
                        form={form}
                        size='large'
                        layout="vertical"
                        onFinish={onSubmit}
                        className="space-y-1"
                    >
                        <Form.Item
                            name="username"
                            label={<span className="text-gray-700 font-medium">账号</span>}
                            rules={[{ required: true, message: '请输入账号' }]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-gray-400" />}
                                placeholder="请输入用户名"
                                className="h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span className="text-gray-700 font-medium">密码</span>}
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                type={isPassVisible ? 'text' : 'password'}
                                placeholder="请输入密码"
                                className="h-12 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                iconRender={visible =>
                                    visible ? <EyeOutlined onClick={() => setIsPassVisible(!isPassVisible)} /> : <EyeInvisibleOutlined onClick={() => setIsPassVisible(!isPassVisible)} />
                                }
                            />
                        </Form.Item>

                        <Form.Item className="mb-6">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="w-full h-12 mt-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-base"
                                block
                            >
                                {loading ? '登录中...' : '登录'}
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* 分隔线 */}
                    <Divider className="my-6">
                        <span className="text-slate-500 font-thin text-sm">或使用以下方式登录</span>
                    </Divider>

                    {/* GitHub登录 */}
                    <div className="flex justify-center">
                        <a
                            href={`${authorize_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}`}
                            target="_blank"
                            className="group flex items-center justify-center w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors duration-300 space-x-2"
                        >
                            <img src={github} alt="" className='w-10 h-10' />
                        </a>
                    </div>
                </div>

                {/* 底部装饰 */}
                <div className="text-center mt-4">
                    <p className="text-gray-500 text-sm">
                        再小的个体，也有自己的品牌
                    </p>
                </div>
            </div>
        </div>
    );
};