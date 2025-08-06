import { useState, useEffect } from 'react';
import { Table, Button, Tag, notification, Card, Popconfirm, Form } from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined, FormOutlined } from '@ant-design/icons';

import { titleSty } from '@/styles/sty';
import Title from '@/components/Title';
import { delArticleDataAPI, getArticleListAPI } from '@/api/Article';
import { useWebStore } from '@/stores';
import type { Tag as ArticleTag } from '@/types/app/tag';
import type { Cate } from '@/types/app/cate';
import type { Article } from '@/types/app/article';
import { ColumnsType } from 'antd/es/table';

export default () => {
    const [loading, setLoading] = useState<boolean>(false);
    
    const web = useWebStore(state => state.web)

    const [current, setCurrent] = useState<number>(1);
    const [articleList, setArticleList] = useState<Article[]>([]);

    const [form] = Form.useForm();

    const getArticleList = async () => {
        try {
            setLoading(true)

            const { data } = await getArticleListAPI({ query: { isDraft: 1 } });
            setArticleList(data as Article[]);

            setLoading(false)
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

    // 标签颜色
    const colors = ['', '#2db7f5', '#87d068', '#f50', '#108ee9'];

    const columns: ColumnsType<Article> = [
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
            title: '操作',
            key: 'action',
            fixed: 'right',
            align: 'center',
            render: (_: string, record: Article) => (
                <div className="flex justify-center space-x-2">
                    <Link to={`/create?id=${record.id}&draft=true`}>
                        <Button icon={<FormOutlined />} />
                    </Link>

                    <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delArticleData(record.id!)}>
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Title value="草稿箱" />

            <Card className={`${titleSty} mt-2 min-h-[calc(100vh-160px)]`}>
                <Table
                    rowKey="id"
                    dataSource={articleList}
                    columns={columns}
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        position: ['bottomCenter'],
                        current,
                        defaultPageSize: 8,
                        onChange(current) {
                            setCurrent(current)
                        }
                    }}
                />
            </Card>
        </div>
    );
};