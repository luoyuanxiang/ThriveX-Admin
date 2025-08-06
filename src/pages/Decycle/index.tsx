import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, notification, Card, Popconfirm, Form } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { titleSty } from '@/styles/sty';
import Title from '@/components/Title';
import { delArticleDataAPI, getArticleListAPI, reductionArticleDataAPI } from '@/api/Article';
import { useWebStore } from '@/stores';
import type { Tag as ArticleTag } from '@/types/app/tag';
import type { Cate } from '@/types/app/cate';
import type { Article } from '@/types/app/article';
import { ColumnType } from 'antd/es/table';

export default () => {
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate()
    const web = useWebStore(state => state.web)

    const [current, setCurrent] = useState<number>(1);
    const [articleList, setArticleList] = useState<Article[]>([]);

    const [form] = Form.useForm();

    const getArticleList = async () => {
        try {
            setLoading(true);

            const { data } = await getArticleListAPI({ query: { isDel: 1 } });
            setArticleList(data);

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getArticleList()
    }, []);

    const delArticleData = async (id: number) => {
        try {
            setLoading(true);

            // 严格删除：彻底从数据库删除，无法恢复
            await delArticleDataAPI(id);
            await getArticleList();
            form.resetFields()
            setCurrent(1)
            notification.success({ message: '🎉 删除文章成功' })
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const reductionArticleData = async (id: number) => {
        try {
            setLoading(true);

            await reductionArticleDataAPI(id)
            notification.success({ message: '🎉 还原文章成功' })
            navigate('/article')

            setLoading(false)
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }

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
            render: (text: string, record: Article) => <a href={`${web.url}/article/${record.id}`} target="_blank" className="hover:text-primary line-clamp-1" rel="noreferrer">{text}</a>,
        },
        {
            title: '摘要',
            dataIndex: 'description',
            key: 'description',
            align: 'center',
            width: 350,
            render: (text: string) => <div className="line-clamp-2">{text ? text : '该文章暂未设置文章摘要'}</div>,
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
            dataIndex: 'isDel',
            key: 'isDel',
            align: 'center',
            render: (isDel: number) => isDel === 1 && <span>删除状态</span>
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
                <div className="flex justify-center space-x-2">
                    <Button onClick={() => reductionArticleData(record.id!)}>还原</Button>

                    <Popconfirm title="警告" description="此操作会彻底文章且无法恢复" okText="确定" cancelText="取消" onConfirm={() => delArticleData(record.id!)}>
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Title value="回收站" />

            <Card className={`${titleSty} mt-2 min-h-[calc(100vh-160px)]`}>
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