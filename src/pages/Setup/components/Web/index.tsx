import { useState } from 'react';
import { Form, Input, Button, message, DatePicker } from 'antd';
import { editWebConfigDataAPI } from '@/api/Config';
import { Web } from '@/types/app/config';
import { useWebStore } from '@/stores';
import dayjs from 'dayjs';

export default () => {
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const web = useWebStore((state) => state.web);
  const setWeb = useWebStore((state) => state.setWeb);

  // 处理初始值，将时间戳转换为 dayjs 对象
  const initialValues = {
    ...web,
    create_time: web.create_time ? dayjs(Number(web.create_time)) : undefined,
  };

  const onSubmit = async (values: Web) => {
    setLoading(true);

    try {
      // 将日期转换为时间戳
      const submitData = {
        ...values,
        create_time: values.create_time ? values.create_time.valueOf() : undefined,
      };

      await editWebConfigDataAPI('web', submitData);
      message.success('🎉 编辑网站成功');
      setWeb(submitData);

      // 使用新的 submitData 来更新表单值
      const newInitialValues = {
        ...submitData,
        create_time: submitData.create_time ? dayjs(Number(submitData.create_time)) : undefined,
      };
      form.setFieldsValue(newInitialValues);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl pb-4 pl-10">网站配置</h2>

      <Form form={form} size="large" layout="vertical" onFinish={onSubmit} initialValues={initialValues} className="w-full lg:w-[500px] md:ml-10">
        <Form.Item label="网站名称" name="title" rules={[{ required: true, message: '网站名称不能为空' }]}>
          <Input placeholder="ThriveX" />
        </Form.Item>

        <Form.Item label="网站副标题" name="subhead" rules={[{ required: true, message: '网站副标题不能为空' }]}>
          <Input placeholder="花有重开日, 人无再少年" />
        </Form.Item>

        <Form.Item label="网站链接" name="url" rules={[{ required: true, message: '网站链接不能为空' }]}>
          <Input placeholder="https://liuyuyang.net/" />
        </Form.Item>

        <Form.Item label="网站图标" name="favicon">
          <Input placeholder="https://liuyuyang.net/favicon.ico" />
        </Form.Item>

        <Form.Item label="网站描述" name="description" rules={[{ required: true, message: '网站描述不能为空' }]}>
          <Input placeholder="记录前端、Python、Java点点滴滴" />
        </Form.Item>

        <Form.Item label="网站关键词" name="keyword" rules={[{ required: true, message: '网站关键词不能为空' }]}>
          <Input placeholder="Java,前端,Python" />
        </Form.Item>

        <Form.Item label="底部信息" name="footer" rules={[{ required: true, message: '网站底部信息不能为空' }]}>
          <Input placeholder="记录前端、Python、Java点点滴滴" />
        </Form.Item>

        <Form.Item label="ICP 备案号" name="icp">
          <Input placeholder="豫ICP备2020031040号-1" />
        </Form.Item>

        <Form.Item label="网站创建时间" name="create_time">
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            保存
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
