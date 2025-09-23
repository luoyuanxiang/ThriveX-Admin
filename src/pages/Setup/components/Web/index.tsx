import { useState } from 'react';
import { Alert, Button, Col, DatePicker, Form, Input, message, Row, Switch } from 'antd';
import { editWebConfigDataAPI } from '@/api/Config';
import { Web } from '@/types/app/config';
import { useWebStore } from '@/stores';
import dayjs from 'dayjs';
import { WebFormValues } from '@/pages/Setup/components/Web/type';
import TextArea from 'antd/es/input/TextArea';

export default () => {
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const web: Web = useWebStore((state) => state.web);
  const setWeb = useWebStore((state) => state.setWeb);

  // 处理初始值，将时间戳转换为 dayjs 对象
  const initialValues = {
    ...web,
    grayscaleDates: web.grayscaleDates ? web.grayscaleDates.join('\n') : '',
    create_time: web.create_time ? dayjs(Number(web.create_time)) : undefined,
  };

  form.setFieldsValue(initialValues)

  const onSubmit = async (values: WebFormValues) => {
    setLoading(true);
    try {
      // 将日期转换为时间戳
      const submitData = {
        ...values,
        grayscaleDates: values.grayscaleDates ? values.grayscaleDates.split('\n') : [],
        create_time: values.create_time ? values.create_time.valueOf() : undefined,
      };

      await editWebConfigDataAPI('web', submitData);
      message.success('🎉 编辑网站成功');
      setWeb(submitData);

      // 使用新的 submitData 来更新表单值
      const newInitialValues = {
        ...submitData,
        grayscaleDates: submitData.grayscaleDates.join('\n'),
        create_time: submitData.create_time ? dayjs(Number(submitData.create_time)) : undefined,
      };
      form.setFieldsValue(newInitialValues);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl pb-4 pl-10">网站配置</h2>

      <Form form={form} size="large" layout="vertical" onFinish={onSubmit} className="w-full lg:w-[100%] md:ml-10">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="网站名称" name="title" rules={[{ required: true, message: '网站名称不能为空' }]}>
              <Input placeholder="ThriveX" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="网站副标题" name="subhead" rules={[{ required: true, message: '网站副标题不能为空' }]}>
              <Input placeholder="花有重开日, 人无再少年" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="网站链接" name="url" rules={[{ required: true, message: '网站链接不能为空' }]}>
              <Input placeholder="https://liuyuyang.net/" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="网站图标" name="favicon">
              <Input placeholder="https://liuyuyang.net/favicon.ico" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="网站描述" name="description" rules={[{ required: true, message: '网站描述不能为空' }]}>
              <Input placeholder="记录前端、Python、Java点点滴滴" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="网站关键词" name="keyword" rules={[{ required: true, message: '网站关键词不能为空' }]}>
              <Input placeholder="Java,前端,Python" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="底部信息" name="footer" rules={[{ required: true, message: '网站底部信息不能为空' }]}>
              <Input placeholder="记录前端、Python、Java点点滴滴" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="ICP 备案号" name="icp">
              <Input placeholder="豫ICP备2020031040号-1" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="网站创建时间" name="create_time">
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="是否开启灯笼" name="lantern">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="动态标题" name="dynamicTitle">
              <Switch />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.dynamicTitle !== currentValues.dynamicTitle}
            >
              {({ getFieldValue }) =>
                getFieldValue('dynamicTitle') ? (
                  <Form.Item
                    label="离开"
                    name="leaveTitle"
                    rules={[{ required: true, message: '离开标题不能为空' }]}
                    className="[&_label]:w-full"
                  >
                    <Input placeholder="w(ﾟДﾟ)w 不要走！再看看嘛！" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.dynamicTitle !== currentValues.dynamicTitle}
            >
              {({ getFieldValue }) =>
                getFieldValue('dynamicTitle') ? (
                  <Form.Item
                    label="回到"
                    name="backTitle"
                    rules={[{ required: true, message: '回到标题不能为空' }]}
                    className="[&_label]:w-full"
                  >
                    <Input placeholder="♪(^∇^*)欢迎肥来！" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="网站变灰日期：MM-dd" name="grayscaleDates" >
              <TextArea autoSize={{ minRows: 2, maxRows: 4 }} size="large" placeholder="请输入网站变灰日期" />
            </Form.Item>
            <Alert message="以换行分隔，每行表示一段文本" type="info" className="mt-2" />
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            保存
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
