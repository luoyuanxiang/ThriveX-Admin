import { Button, Form, Input, message } from 'antd';
import {
  getBaiduStatisticsAPI,
  editBaiduStatisticsAPI,
} from '@/api/BaiduStatistics.ts';
import { useEffect, useState } from 'react';
import { BaiduStatistics } from '@/types/app/baiduStatistics.ts';

export default () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const getBaiduStatisticsData = async () => {
    const { data } = await getBaiduStatisticsAPI();
    form.setFieldsValue(data);
  };

  useEffect(() => {
    getBaiduStatisticsData();
  }, []);

  const handleSubmit = async (values: BaiduStatistics) => {
    setLoading(true);
    await editBaiduStatisticsAPI(values);
    message.success('🎉 修改配置成功');
    setLoading(false);
  };

  return (
    <>
      <div className="mt-8">
        <Form
          form={form}
          size="large"
          layout="vertical"
          onFinish={handleSubmit}
          className="w-full lg:w-[500px] md:ml-10"
        >
          <Form.Item label="id" name="id" hidden>
            <Input  />
          </Form.Item>
          <Form.Item label="appKey" name="appKey">
            <Input placeholder="appKey" />
          </Form.Item>

          <Form.Item label="secretKey" name="secretKey">
            <Input placeholder="secretKey" />
          </Form.Item>

          <Form.Item label="siteId" name="siteId">
            <Input placeholder="siteId" />
          </Form.Item>

          <Form.Item label="accessToken" name="accessToken">
            <Input placeholder="accessToken" />
          </Form.Item>

          <Form.Item label="refreshToken" name="refreshToken">
            <Input placeholder="refreshToken" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};
