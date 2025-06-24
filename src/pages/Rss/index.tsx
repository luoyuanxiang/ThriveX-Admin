import React, { useEffect, useState } from 'react';
import { Avatar, Card, List, Space, Spin } from 'antd';
import Title from '@/components/Title';
import { getRssListAPI } from '@/api/Rss';
import { Rss } from '@/types/app/rss';
import { BiCategory } from "react-icons/bi";
import { LuTimer } from "react-icons/lu";
import dayjs from 'dayjs';

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space className='gap-x-1'>
        {React.createElement(icon)} {text}
    </Space>
);

export default () => {
    const [loading, setLoading] = useState<boolean>(true);

    const [list, setList] = useState<Rss[]>([]);

    const getRssList = async () => {
        try {
            setLoading(true);

            const { data } = await getRssListAPI();
            setList(data);

            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRssList();
    }, []);

    return (
        <div>
            <Title value='订阅中心' />

            <Spin spinning={loading}>
                <Card className='mt-2 min-h-[calc(100vh-160px)]'>
                    <List
                        dataSource={list}
                        size="large"
                        itemLayout="vertical"
                        pagination={{
                            align: "center",
                            pageSize: 8
                        }}
                        renderItem={(item: Rss) => (
                            <List.Item
                                key={item.title}
                                className='!p-[16px_0] md:!p-[16px_24px]'
                                actions={[
                                    <div className='flex space-x-4'>
                                        <IconText icon={BiCategory} text={item.type} key="list-vertical-star-o" />
                                        <IconText icon={LuTimer} text={dayjs(+item.createTime!).format('YYYY-MM-DD HH:mm:ss')} key="list-vertical-like-o" />
                                    </div>
                                ]}
                            // extra={<img alt="logo" src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png" className='h-30' />}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={item.image} className='w-15 h-15 mr-2' />}
                                    title={<a href={item.url} target='_blank'>{item.title}</a>}
                                    description={<div className='line-clamp-3 md:line-clamp-none'>{item.description}</div>}
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            </Spin>
        </div>
    );
};