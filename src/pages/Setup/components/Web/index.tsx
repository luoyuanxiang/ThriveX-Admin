import { useState } from 'react';
import { Form, Input, Button, message, Radio } from 'antd';
import { editConfigDataAPI } from '@/api/Project';
import { Web } from '@/types/app/project'
import { useWebStore } from '@/stores';

export default () => {
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();

    const web = useWebStore(state => state.web)
    const setWeb = useWebStore(state => state.setWeb)

    const onSubmit = async (values: Web) => {
        setLoading(true);

        try {
            await editConfigDataAPI("web", values);
            message.success("🎉 编辑网站成功");
            setWeb(values)
            form.setFieldsValue(values);
        } catch (error) {
            setLoading(false);
        }

        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-xl pb-4 pl-10">网站配置</h2>

            <Form
                form={form}
                size='large'
                layout="vertical"
                onFinish={onSubmit}
                initialValues={web}
                className="w-full lg:w-[500px] md:ml-10"
            >
              <Form.Item name="confetti" label="是否开启礼花">
                <Radio.Group
                  value="confetti"
                  options={[
                    { value: 'true', label: '开启' },
                    { value: 'false', label: '关闭' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="是否全局开启评论" name="globalComment">
                <Radio.Group
                  value="globalComment"
                  options={[
                    { value: 'true', label: '开启' },
                    { value: 'false', label: '关闭' },
                  ]}
                />
              </Form.Item>
                <Form.Item
                    label="网站名称"
                    name="title"
                    rules={[{ required: true, message: '网站名称不能为空' }]}
                >
                    <Input placeholder="Thrive" />
                </Form.Item>

                <Form.Item
                    label="网站副标题"
                    name="subhead"
                    rules={[{ required: true, message: '网站副标题不能为空' }]}
                >
                    <Input placeholder="花有重开日, 人无再少年" />
                </Form.Item>

                <Form.Item
                    label="网站链接"
                    name="url"
                    rules={[{ required: true, message: '网站链接不能为空' }]}
                >
                    <Input placeholder="https://liuyuyang.net/" />
                </Form.Item>

                <Form.Item
                    label="网站图标"
                    name="favicon"
                >
                    <Input placeholder="https://liuyuyang.net/favicon.ico" />
                </Form.Item>

                <Form.Item
                    label="网站描述"
                    name="description"
                    rules={[{ required: true, message: '网站描述不能为空' }]}
                >
                    <Input placeholder="记录前端、Python、Java点点滴滴" />
                </Form.Item>

                <Form.Item
                    label="网站关键词"
                    name="keyword"
                    rules={[{ required: true, message: '网站关键词不能为空' }]}
                >
                    <Input placeholder="Java,前端,Python" />
                </Form.Item>

                <Form.Item
                    label="底部信息"
                    name="footer"
                    rules={[{ required: true, message: '网站底部信息不能为空' }]}
                >
                    <Input placeholder="记录前端、Python、Java点点滴滴" />
                </Form.Item>
              <Form.Item
                label="ICP"
                name="icp"
              >
                <Input placeholder="备案号，留空则不显示" />
              </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>保存</Button>
                </Form.Item>
            </Form>
        </div>
    );
};