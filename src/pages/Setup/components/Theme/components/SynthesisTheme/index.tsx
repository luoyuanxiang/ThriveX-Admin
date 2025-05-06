import { useState, useEffect } from 'react';
import { notification, Divider, Input, Alert, Button, Form, Radio } from 'antd';
import { PictureOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { editConfigDataAPI, getConfigDataAPI } from '@/api/Project';
import { Theme } from '@/types/app/project';
import Material from '@/components/Material';

export default () => {
    const [loading, setLoading] = useState<boolean>(false);

    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>({} as Theme);

    const [form] = Form.useForm();

    const [currentUploadType, setCurrentUploadType] = useState<string>('');

    const onSidebar = (value: string) => {
        const rightSidebar = JSON.parse(theme.right_sidebar || '[]');
        const index = rightSidebar.indexOf(value);
        index > -1 ? rightSidebar.splice(index, 1) : rightSidebar.push(value);
        setTheme({ ...theme, right_sidebar: JSON.stringify(rightSidebar) });
    };

    const getLayoutData = async () => {
        try {
            setLoading(true);

            const { data } = await getConfigDataAPI<Theme>("layout");
            setTheme(data);

            form.setFieldsValue({
                light_logo: data.light_logo,
                dark_logo: data.dark_logo,
                swiper_image: data.swiper_image,
                swiper_text: data.swiper_text ? JSON.parse(data.swiper_text).join('\n') : '',
                social: data.social,
                covers: data.covers ? JSON.parse(data.covers).join("\n") : '',
                reco_article: data.reco_article ? JSON.parse(data.reco_article).join("\n") : '',
                lantern: data.lantern
            });

            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    useEffect(() => {
        getLayoutData();
    }, []);

    const editThemeData = async (values: any) => {
        try {
            setLoading(true);

            const updatedLayout = {
                ...theme,
                ...values,
                swiper_text: JSON.stringify(values.swiper_text.split('\n')),
                covers: JSON.stringify(values.covers.split('\n')),
                reco_article: JSON.stringify(values.reco_article.split('\n')),
            };

            await editConfigDataAPI("layout", updatedLayout);

            notification.success({
                message: '成功',
                description: '🎉 修改主题成功',
            });

            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const getFile = (name: string) => {
        return new URL(`../../image/${name}.png`, import.meta.url).href;
    };

    const UploadBtn = ({ type }: { type: string }) => (
        <CloudUploadOutlined
            className='text-xl cursor-pointer'
            onClick={() => {
                setCurrentUploadType(type);
                setIsMaterialModalOpen(true);
            }}
        />
    );

    return (
        <div>
            <h2 className="text-xl pb-4 pl-10">综合配置</h2>

            <div className='w-full lg:w-[500px] md:ml-10'>
                <Form form={form} onFinish={editThemeData} layout="vertical">
                  <Form.Item name="lantern" label="是否开启红灯笼">
                    <Radio.Group
                      value="lantern"
                      options={[
                        { value: 'true', label: '开启' },
                        { value: 'false', label: '关闭' },
                      ]}
                    />
                  </Form.Item>

                    <Divider orientation="left">首页背景图</Divider>
                    <Form.Item name="swiper_image" label="首页背景图">
                        <Input
                            prefix={<PictureOutlined />}
                            addonAfter={<UploadBtn type="swiper_image" />}
                            size='large'
                            placeholder="请输入背景图地址"
                        />
                    </Form.Item>
                    <img src={form.getFieldValue('swiper_image')} alt="" className="w-1/3 mt-4 rounded" />

                    <Divider orientation="left">打字机文本</Divider>
                    <Form.Item name="swiper_text" label="打字机文本">
                        <Input.TextArea
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            size='large'
                            placeholder="请输入打字机文本"
                        />
                    </Form.Item>
                    <Alert message="以换行分隔，每行表示一段文本" type="info" className="mt-2" />

                    <Divider orientation="left">社交网站</Divider>
                    <Form.Item name="social" label="社交网站">
                        <Input.TextArea
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            size='large'
                            placeholder="请输入社交网站"
                        />
                    </Form.Item>
                    <Alert message="请务必确保每一项格式正确，否则会导致网站无法访问" type="info" className="mt-2" />

                    <Divider orientation="left">文章随机封面</Divider>
                    <Form.Item name="covers" label="文章随机封面">
                        <Input.TextArea
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            size='large'
                            placeholder="请输入文章随机封面"
                        />
                    </Form.Item>
                    <Alert message="以换行分隔，每行表示一段文本" type="info" className="mt-2" />

                    <Divider orientation="left">作者推荐文章</Divider>
                    <Form.Item name="reco_article" label="作者推荐文章">
                        <Input.TextArea
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            size='large'
                            placeholder="请输入作者推荐文章ID"
                        />
                    </Form.Item>
                    <Alert message="以换行分隔，每行表示一段文本" type="info" className="mt-2" />

                    <Divider orientation="left">侧边栏</Divider>
                    <div className='overflow-auto w-full'>
                        <div className="sidebar w-[750px] flex mb-4">
                            {['author', 'randomArticle', 'newComments', 'hotArticle'].map((item) => (
                                <div key={item} className={`item flex flex-col items-center p-4 m-4 border-2 rounded cursor-pointer ${theme.right_sidebar && JSON.parse(theme.right_sidebar).includes(item) ? 'border-primary' : 'border-[#eee]'}`} onClick={() => onSidebar(item)}>
                                    <p className={`text-center ${theme.right_sidebar && JSON.parse(theme.right_sidebar).includes(item) ? 'text-primary' : ''}`}>
                                        {item === 'author' ? '作者信息模块' : item === 'hotArticle' ? '作者推荐模块' : item === 'randomArticle' ? '随机推荐模块' : '最新评论模块'}
                                    </p>
                                    <img src={`${getFile(item)}`} alt="" className="mt-4 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Divider orientation="left">文章布局</Divider>
                    <div className='overflow-auto w-full'>
                        <div className="article flex w-[650px]">
                            {['classics', 'card', 'waterfall'].map((item) => (
                                <div key={item} onClick={() => setTheme({ ...theme, is_article_layout: item })} className={`item flex flex-col items-center p-4 m-4 border-2 rounded cursor-pointer ${theme.is_article_layout === item ? 'border-primary' : 'border-[#eee]'}`}>
                                    <p className={`text-center ${theme.is_article_layout === item ? 'text-primary' : ''}`}>
                                        {item === 'classics' ? '经典布局' : item === 'card' ? '卡片布局' : '瀑布流布局'}
                                    </p>
                                    <img src={`${getFile(item)}`} alt="" className="w-[200px] mt-4 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button type="primary" size="large" className="w-full mt-4" htmlType="submit" loading={loading}>保存</Button>
                </Form>
            </div>

            <Material
                open={isMaterialModalOpen}
                onClose={() => {
                    setIsMaterialModalOpen(false);
                    setCurrentUploadType('');
                }}
                onSelect={(url: string[]) => {
                    if (currentUploadType) {
                        form.setFieldValue(currentUploadType, url[0]);
                        form.validateFields([currentUploadType]);
                        setTheme({ ...theme, [currentUploadType]: url[0] });
                    }
                }}
            />
        </div>
    );
};