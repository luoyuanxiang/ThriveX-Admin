import { useState, useEffect, useRef } from 'react';
import { Table, Button, Tag, notification, Card, Popconfirm, Form, Input, Select, DatePicker, Modal, message } from 'antd';
import { DeleteOutlined, FormOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadFileStatus, RcFile } from 'antd/es/upload/interface';
import { titleSty } from '@/styles/sty'
import Title from '@/components/Title';
import { Link } from 'react-router-dom';

import { getCateListAPI } from '@/api/Cate'
import { getTagListAPI } from '@/api/Tag'
import { delArticleDataAPI, getArticleListAPI, importArticleDataAPI } from '@/api/Article';
import type { Tag as ArticleTag } from '@/types/app/tag';
import type { Cate } from '@/types/app/cate';
import type { Article, Config, FilterArticle, FilterForm } from '@/types/app/article';

import { useWebStore } from '@/stores';

import dayjs from 'dayjs';
import { ColumnType } from 'antd/es/table';

export default () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [importLoading, setImportLoading] = useState<boolean>(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form] = Form.useForm();
    const web = useWebStore(state => state.web);
    const [current, setCurrent] = useState<number>(1);
    const [articleList, setArticleList] = useState<Article[]>([]);
    const { RangePicker } = DatePicker;

    const getArticleList = async () => {
        try {
            setLoading(true);

            const { data } = await getArticleListAPI();
            setArticleList(data);

            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const delArticleData = async (id: number) => {
        try {
            setLoading(true);

            // 普通删除：可从回收站恢复
            await delArticleDataAPI(id, true);
            await getArticleList();
            form.resetFields()
            setCurrent(1)
            notification.success({ message: '🎉 删除文章成功' })
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    // 标签颜色
    const colors = ['', '#2db7f5', '#87d068', '#f50', '#108ee9'];

    const columns: ColumnType<Article>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 100,
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            align: 'center',
            width: 300,
            render: (text: string, record: Article) => <a href={`${web.url}/article/${record.id}`} target='_blank' className='hover:text-primary line-clamp-1'>{text}</a>,
        },
        {
            title: '摘要',
            dataIndex: 'description',
            key: 'description',
            align: 'center',
            width: 350,
            render: (text: string) => <div className='line-clamp-2'>{text ? text : '该文章暂未设置文章摘要'}</div>,
        },
        {
            title: '分类',
            dataIndex: 'cateList',
            key: 'cateList',
            align: 'center',
            render: (cates: Cate[]) => cates.map((item, index) => <Tag key={item.id} color={colors[index]}>{item.name}</Tag>)
        },
        {
            title: '标签',
            dataIndex: 'tagList',
            key: 'tagList',
            align: 'center',
            render: (tags: ArticleTag[]) => tags.map((item, index) => <Tag key={item.id} color={colors[index]}>{item.name}</Tag>)
        },
        {
            title: '浏览量',
            dataIndex: 'view',
            key: 'view',
            align: 'center',
            sorter: (a: Article, b: Article) => a.view! - b.view!
        },
        {
            title: '评论数量',
            dataIndex: 'comment',
            key: 'comment',
            align: 'center',
            render: (data: string) => <span>{data}</span>,
            sorter: (a: Article, b: Article) => a.comment! - b.comment!
        },
        {
            title: '状态',
            dataIndex: 'config',
            key: 'config',
            align: 'center',
            render: (config: Config) => (
                config.status === "default" && <span>正常</span> ||
                config.status === "no_home" && <span>不在首页显示</span> ||
                config.status === "hide" && <span>隐藏</span> ||
                config.password.trim().length && <span>文章加密</span>
            ),
        },
        {
            title: '发布时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center',
            width: 200,
            render: (text: string) => dayjs(+text).format('YYYY-MM-DD HH:mm:ss'),
            sorter: (a: Article, b: Article) => +a.createTime! - +b.createTime!,
            showSorterTooltip: false
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            align: 'center',
            render: (_: string, record: Article) => (
                <div className='flex justify-center space-x-2'>
                    <Link to={`/create?id=${record.id}`}>
                        <Button icon={<FormOutlined />} />
                    </Link>

                    <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delArticleData(record.id!)}>
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const onFilterSubmit = async (values: FilterForm) => {
        try {
            setLoading(true)

            const query: FilterArticle = {
                key: values.title,
                cateId: values.cateId,
                tagId: values.tagId,
                isDraft: 0,
                isDel: 0,
                startDate: values.createTime && values.createTime[0].valueOf() + '',
                endDate: values.createTime && values.createTime[1].valueOf() + ''
            }

            const { data } = await getArticleListAPI({ query });
            setArticleList(data);

            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
    }

    const [cateList, setCateList] = useState<Cate[]>([])
    const [tagList, setTagList] = useState<ArticleTag[]>([])

    const getCateList = async () => {
        const { data } = await getCateListAPI()
        setCateList(data.filter(item => item.type === "cate") as Cate[])
    }

    const getTagList = async () => {
        const { data } = await getTagListAPI()
        setTagList(data as ArticleTag[])
    }

    // 处理导入文件
    const handleImport = async () => {
        if (fileList.length === 0) {
            notification.warning({ message: '请选择要导入的文件' });
            return;
        }

        try {
            setImportLoading(true);
            const files = fileList.map(file => file.originFileObj as File);
            await importArticleDataAPI(files);
            await getArticleList();
            setFileList([]);
            setIsModalOpen(false);
            notification.success({ message: '🎉 导入文章成功' });
        } catch (error) {
            console.log("文章导入失败", error);
        } finally {
            setImportLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFileList([]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    // 拖拽上传
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        // 检查文件扩展名是否为 .md
        const markdownFiles = files.filter(file =>
            file.name.toLowerCase().endsWith('.md') ||
            file.type === 'text/markdown'
        );

        if (markdownFiles.length === 0) {
            message.error('请上传 Markdown 格式文件（.md）');
            return;
        }

        if (fileList.length + markdownFiles.length > 5) {
            message.error('最多只能上传5个文件');
            return;
        }

        const newFileList: UploadFile[] = markdownFiles.map(file => {
            const rcFile = file as RcFile;
            rcFile.uid = Math.random().toString();
            return {
                uid: rcFile.uid,
                name: file.name,
                status: 'done' as UploadFileStatus,
                originFileObj: rcFile,
            };
        });

        setFileList([...fileList, ...newFileList]);
        message.success(`成功添加 ${markdownFiles.length} 个文件`);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // 检查文件扩展名是否为 .md
        const markdownFiles = files.filter(file =>
            file.name.toLowerCase().endsWith('.md') ||
            file.type === 'text/markdown'
        );

        if (markdownFiles.length === 0) {
            message.error('请上传 Markdown 格式文件（.md）');
            return;
        }

        if (fileList.length + markdownFiles.length > 5) {
            message.error('最多只能上传5个文件');
            return;
        }

        const newFileList: UploadFile[] = markdownFiles.map(file => {
            const rcFile = file as RcFile;
            rcFile.uid = Math.random().toString();
            return {
                uid: rcFile.uid,
                name: file.name,
                status: 'done' as UploadFileStatus,
                originFileObj: rcFile,
            };
        });

        setFileList([...fileList, ...newFileList]);
        message.success(`成功添加 ${markdownFiles.length} 个文件`);
        e.target.value = ''; // 清空 input 的值，允许重复选择相同文件
    };

    useEffect(() => {
        getArticleList()
        getCateList()
        getTagList()
    }, [])

    return (
        <div>
            <Title value="文章管理" />

            <Card className='my-2 overflow-scroll'>
                <div className='w-full flex justify-between'>
                    <Form form={form} layout="inline" onFinish={onFilterSubmit} autoComplete="off" className='flex-nowrap'>
                        <Form.Item label="标题" name="title" className='min-w-[200px]'>
                            <Input placeholder='请输入关键词' />
                        </Form.Item>

                        <Form.Item label="分类" name="cateId" className='min-w-[200px]'>
                            <Select
                                allowClear
                                options={cateList}
                                fieldNames={{ label: "name", value: "id" }}
                                placeholder="请选择分类"
                            />
                        </Form.Item>

                        <Form.Item label="标签" name="tagId" className='min-w-[200px]'>
                            <Select
                                allowClear
                                showSearch
                                options={tagList}
                                fieldNames={{ label: 'name', value: 'id' }}
                                placeholder="请选择标签"
                                filterOption={(input, option) => {
                                    if (option?.name) {
                                        return option.name.toLowerCase().includes(input.toLowerCase());
                                    }
                                    return false;
                                }}
                            />
                        </Form.Item>

                        <Form.Item label="时间范围" name="createTime" className='min-w-[250px]'>
                            <RangePicker placeholder={["选择起始时间", "选择结束时间"]} />
                        </Form.Item>

                        <Form.Item className='pr-6'>
                            <Button type="primary" htmlType="submit">查询</Button>
                        </Form.Item>
                    </Form>

                    <Button
                        type="primary"
                        onClick={() => setIsModalOpen(true)}
                    >导入文章</Button>
                </div>
            </Card>

            <Modal
                title="导入文章"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>取消</Button>,

                    <Button
                        key="import"
                        type="primary"
                        onClick={handleImport}
                        loading={importLoading}
                        disabled={fileList.length === 0}
                    >开始导入</Button>
                ]}
            >
                <div className='py-4'>
                    <div
                        onClick={() => fileInputRef?.current?.click()}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-full h-40 p-4 border border-dashed rounded-lg transition-all duration-300 ${isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-[#D7D7D7] hover:border-primary bg-[#FAFAFA]'
                            } space-y-2 cursor-pointer`}
                    >
                        <div className="flex justify-center">
                            <InboxOutlined className="text-5xl text-primary" />
                        </div>

                        <p className="text-base text-center">
                            {isDragging ? '释放文件以上传' : '点击或拖动文件到此区域进行上传'}
                        </p>
                        <p className="text-sm text-[#999] text-center">
                            支持单个或多个上传，最多5个文件，仅支持Markdown格式
                        </p>
                    </div>

                    <input
                        multiple
                        type="file"
                        onChange={handleFileInput}
                        ref={fileInputRef}
                        className="hidden"
                        accept=".md"
                    />

                    {fileList.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">已选择的文件：</p>
                            <ul className="space-y-2">
                                {fileList.map((file) => (
                                    <li key={file.uid} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-sm">{file.name}</span>

                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            onClick={() => setFileList(fileList.filter(f => f.uid !== file.uid))}
                                        >删除</Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </Modal>

            <Card className={`${titleSty} min-h-[calc(100vh-250px)]`}>
                <Table
                    rowKey="id"
                    dataSource={articleList}
                    columns={columns}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        position: ['bottomCenter'],
                        current,
                        defaultPageSize: 8,
                        onChange(current) {
                            setCurrent(current)
                        }
                    }}
                    loading={loading}
                />
            </Card>
        </div>
    );
};