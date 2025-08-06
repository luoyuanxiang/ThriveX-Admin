import { useEffect, useState } from 'react';

import { Card, Spin } from 'antd';

import { getCommentListAPI } from '@/api/Comment';
import { getLinkListAPI } from '@/api/Web';
import { getWallListAPI } from '@/api/Wall';

import { Wall } from '@/types/app/wall';
import { Web } from '@/types/app/web';
import { Comment as CommentType } from '@/types/app/comment';

import Empty from '@/components/Empty';
import Title from '@/components/Title';
import List from './components/List';

import comment from './image/comment.svg';
import info from './image/message.svg';
import link from './image/link.svg';

type Menu = 'comment' | 'link' | 'wall';

export default () => {
  const [loading, setLoading] = useState(false);

  const activeSty = 'bg-[#f9f9ff] dark:bg-[#3c5370] text-primary';
  const [active, setActive] = useState<Menu>('comment');
  const [commentList, setCommentList] = useState<CommentType[]>([]);
  const [linkList, setLinkList] = useState<Web[]>([]);
  const [wallList, setWallList] = useState<Wall[]>([]);

  // 重新获取最新数据
  const fetchData = async (type: Menu) => {
    try {
      setLoading(true);

      if (type === 'comment') {
        const { data } = await getCommentListAPI({ query: { status: 0 }, pattern: 'list' });
        setCommentList(data);
      } else if (type === 'link') {
        const { data } = await getLinkListAPI({ query: { status: 0 } });
        setLinkList(data);
      } else if (type === 'wall') {
        const { data } = await getWallListAPI({ query: { status: 0 } });
        setWallList(data);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(active);
  }, [active]);

  const renderList = (list: CommentType[] | Web[] | Wall[], type: Menu) => {
    if (list.length === 0) {
      return <Empty />;
    }
    return list.map((item) => <List key={item.id} item={item} type={type} fetchData={(type) => fetchData(type)} setLoading={setLoading} />);
  };

  return (
    <div>
      <Title value="工作台" />

      <Card className="mt-2 min-h-[calc(100vh-160px)]">
        <div className="flex flex-col md:flex-row w-full">
          <div className="w-full min-w-[200px] md:w-2/12 md:min-h-96 mb-5 md:mb-0 pr-4 md:border-b-transparent md:border-r border-stroke dark:border-strokedark">
            <ul className="space-y-1">
              {(['comment', 'link', 'wall'] as Menu[]).map((menu) => (
                <li key={menu} className={`flex items-center w-full py-3 px-4 hover:bg-[#f9f9ff] dark:hover:bg-[#3c5370] hover:text-primary ${active === menu ? activeSty : ''} rounded-md text-base cursor-pointer transition-colors`} onClick={() => setActive(menu)}>
                  <img src={menu === 'comment' ? comment : menu === 'link' ? link : info} alt="" className="w-8 mr-4" />
                  <span>{menu === 'comment' ? '评论' : menu === 'link' ? '友联' : '留言'}</span>
                </li>
              ))}
            </ul>
          </div>

          <Spin spinning={loading}>
            <div className="w-full md:w-10/12 md:pl-6 py-4 space-y-10">
              {active === 'link' && renderList(linkList, 'link')}
              {active === 'comment' && renderList(commentList, 'comment')}
              {active === 'wall' && renderList(wallList, 'wall')}
            </div>
          </Spin>
        </div>
      </Card>
    </div>
  );
};
