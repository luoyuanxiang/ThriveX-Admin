import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'antd/es/form/Form';
import { Button, Form, Input, notification } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { loginDataAPI } from '@/api/User';
import { useUserStore } from '@/stores';
import { getRolePermissionListAPI } from '@/api/Role';

export default () => {
    const navigate = useNavigate();
    const location = useLocation();
    const store = useUserStore();

    const [loading, setLoading] = useState(false)

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
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="overflow-hidden relative w-[400px] h-[380px] rounded-lg bg-white shadow-[4px_6px_200px_200px_rgba(121,122,243,0.1)]">
                <div className="flex flex-col justify-center items-center h-25 bg-primary text-white">
                    <h3 className="text-3xl">墨韵云阁</h3>
                    <p className="text-gray-300 mt-2">现代化博客管理系统</p>
                </div>

                <Form
                    form={form}
                    size='large'
                    layout="vertical"
                    onFinish={onSubmit}
                    className='pt-5 px-10'
                >
                    <Form.Item
                        name="username"
                        label="账号"
                        rules={[{ required: true, message: '请输入账号' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            type={isPassVisible ? 'text' : 'password'}
                            placeholder="请输入密码"
                            iconRender={visible =>
                                visible ? <EyeOutlined onClick={() => setIsPassVisible(!isPassVisible)} /> : <EyeInvisibleOutlined onClick={() => setIsPassVisible(!isPassVisible)} />
                            }
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} className="w-full" block>登录</Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};