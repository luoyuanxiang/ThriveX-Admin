import { Button, Form, Input, message } from "antd"
import { editOtherDataAPI, getOtherDataAPI } from "@/api/Config";
import { useEffect, useState } from "react";

interface EmailForm {
    host: string,
    port: number,
    username: string,
    password: string
}

export default () => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm();

    const getOtherData = async () => {
        const { data } = await getOtherDataAPI()
        form.setFieldsValue(JSON.parse(data.email))
    }

    useEffect(() => {
        getOtherData()
    }, [])

    const handleSubmit = async (values: EmailForm) => {
        setLoading(true)
        await editOtherDataAPI({
            email: JSON.stringify(values)
        })
        message.success("🎉 修改配置成功");
        setLoading(false)
    };

    return (
        <>
            <div className="mt-8">
                <Form
                    form={form}
                    size='large'
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="w-full lg:w-[500px] md:ml-10"
                >
                    <Form.Item label="邮箱服务器" name="host">
                        <Input placeholder="smtp.qq.com" />
                    </Form.Item>

                    <Form.Item label="邮箱端口" name="port">
                        <Input placeholder="465" />
                    </Form.Item>

                    <Form.Item label="邮箱用户名" name="username">
                        <Input placeholder="3311118881@qq.com" />
                    </Form.Item>

                    <Form.Item label="邮箱授权码" name="password">
                        <Input placeholder="audhaudhaudhauddwq" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} className="w-full">保存</Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
}