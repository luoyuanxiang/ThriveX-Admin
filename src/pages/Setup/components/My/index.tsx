import { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';

import { useUserStore } from '@/stores';
import { editUserDataAPI, getUserDataAPI } from '@/api/User';
import { User } from '@/types/app/user';

interface UserForm {
  name: string;
  email: string;
  avatar: string;
  info: string;
}

export default () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = Form.useForm<UserForm>();
  const store = useUserStore();

  const getUserData = async () => {
    try {
      setLoading(true);

      const { data } = await getUserDataAPI(store.user?.id);
      store.setUser(data);
      form.setFieldsValue(data);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const onSubmit = async (values: UserForm) => {
    try {
      setLoading(true);

      await editUserDataAPI({
        id: store.user.id,
        ...values,
        role: undefined,
      });

      getUserData();
      message.success('🎉 修改用户信息成功');
      store.setUser(values as User);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl pb-4 pl-10">个人配置</h2>

      <Form form={form} size="large" layout="vertical" onFinish={onSubmit} className="w-full lg:w-[500px] md:ml-10">
        <Form.Item label="名称" name="name" rules={[{ required: true, message: '名称不能为空' }]}>
          <Input placeholder="宇阳" />
        </Form.Item>

        <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '邮箱不能为空' }]}>
          <Input placeholder="liuyuyang1024@yeah.net" />
        </Form.Item>

        <Form.Item label="头像" name="avatar" rules={[{ required: true, message: '头像不能为空' }]}>
          <Input placeholder="https://liuyuyang.net/logo.png" />
        </Form.Item>

        <Form.Item label="介绍" name="info" rules={[{ required: true, message: '介绍不能为空' }]}>
          <Input placeholder="互联网从不缺乏天才, 而努力才是最终的入场劵" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="w-full">
            保存
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
