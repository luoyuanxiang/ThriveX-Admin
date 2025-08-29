import { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { editWebConfigDataAPI, getWebConfigDataAPI } from '@/api/Config';
import { Other, Web } from '@/types/app/config';
import dayjs from 'dayjs';

export default () => {
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const getConfigData = async () => {
    try {
      setLoading(true);
      const { data } = await getWebConfigDataAPI<{ value: Other }>('other');
      form.setFieldsValue(data.value);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    getConfigData();
  }, []);

  const onSubmit = async (values: Web) => {
    setLoading(true);

    try {
      // 将日期转换为时间戳
      const submitData = {
        ...values,
        create_time: values.create_time ? values.create_time.valueOf() : undefined,
      };

      await editWebConfigDataAPI('other', submitData);
      message.success('🎉 编辑配置成功');

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
      <h2 className="text-xl pb-4 pl-10">其他配置</h2>

      <Form form={form} size="large" layout="vertical" onFinish={onSubmit} className="w-full lg:w-[500px] md:ml-10">
        <Form.Item label="百度统计 Token" name="baidu_token">
          <Input placeholder="e5bf799a3e49312141c8b677b7bec1c2" />
        </Form.Item>

        <Form.Item label="HCaptcha Key" name="hcaptcha_key" rules={[{ required: true, message: 'HCaptcha Key 不能为空' }]}>
          <Input placeholder="bfb82d04-e46a-4da0-9b6e-9adc052672c8" />
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
