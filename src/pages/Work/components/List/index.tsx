import { useState } from 'react';

import { Button, Dropdown, message, Modal } from 'antd';
import dayjs from 'dayjs';

import { auditCommentDataAPI, delCommentDataAPI, addCommentDataAPI } from '@/api/Comment';
import { auditWallDataAPI, delWallDataAPI } from '@/api/Wall';
import { delLinkDataAPI, auditWebDataAPI } from '@/api/Web';
import { sendDismissEmailAPI, sendReplyWallEmailAPI } from '@/api/Email';

import RandomAvatar from '@/components/RandomAvatar';
import { useUserStore, useWebStore } from '@/stores';
import TextArea from 'antd/es/input/TextArea';

type Menu = 'comment' | 'link' | 'wall';

interface ListItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  type: Menu;
  fetchData: (type: Menu) => void;
  setLoading: (loading: boolean) => void;
}

export default ({ item, type, fetchData, setLoading }: ListItemProps) => {
  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  const web = useWebStore((state) => state.web);
  const user = useUserStore((state) => state.user);

  const [btnType, setBtnType] = useState<'reply' | 'dismiss' | string>('');

  // 通过
  const handleApproval = async () => {
    setLoading(true);

    try {
      if (type === 'link') {
        await auditWebDataAPI(item.id);
      } else if (type === 'comment') {
        await auditCommentDataAPI(item.id);
      } else if (type === 'wall') {
        await auditWallDataAPI(item.id);
      }

      await fetchData(type);
      if (btnType !== 'reply') message.success('🎉 审核成功');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // 回复
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyInfo, setReplyInfo] = useState('');
  const handleReply = async () => {
    setBtnLoading(true);

    try {
      // 审核通过
      await handleApproval();

      if (type === 'comment') {
        // 发送回复内容
        await addCommentDataAPI({
          avatar: user.avatar,
          url: web.url,
          content: replyInfo,
          commentId: item.id!,
          auditStatus: 1,
          email: user.email ? user.email : null,
          name: user.name,
          articleId: item.articleId!,
          createTime: new Date().getTime().toString(),
        });
      }

      if (type === 'wall') {
        await sendReplyWallEmailAPI({
          to: item.email!,
          recipient: item.name!,
          your_content: item.content!,
          reply_content: replyInfo,
          time: dayjs(+item.createTime!).format('YYYY-MM-DD HH:mm:ss'),
          url: web.url + '/wall/all',
        });
      }

      await fetchData(type);
      message.success('🎉 回复成功');
      setReplyInfo('');
      setBtnType('');
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      setBtnLoading(false);
    }

    setBtnLoading(false);
  };

  // 驳回
  const [dismissInfo, setDismissInfo] = useState('');
  const handleDismiss = async () => {
    setBtnLoading(true);

    try {
      if (type === 'link') {
        await delLinkDataAPI(item.id);
      } else if (type === 'comment') {
        await delCommentDataAPI(item.id);
      } else if (type === 'wall') {
        await delWallDataAPI(item.id);
      }

      // 有内容就发送驳回通知邮件，反之直接删除
      if (dismissInfo.trim().length) await sendDismissEmail();

      await fetchData(type);
      message.success('🎉 驳回成功');
      setDismissInfo('');
      setBtnType('');
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      setBtnLoading(false);
    }

    setBtnLoading(false);
  };

  // 发送驳回通知邮件
  const sendDismissEmail = async () => {
    // 类型名称
    let email_info = {
      name: '',
      type: '',
      url: '',
    };

    switch (type) {
      case 'link':
        email_info = {
          name: item.title,
          type: '友链',
          url: `${web.url}/friend`,
        };
        break;
      case 'comment':
        email_info = {
          name: item.name,
          type: '评论',
          url: `${web.url}/article/${item.articleId}`,
        };
        break;
      case 'wall':
        email_info = {
          name: item.name,
          type: '留言',
          url: `${web.url}/wall/all`,
        };
        break;
    }

    // 有邮箱才会邮件通知
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    item.email != null &&
      (await sendDismissEmailAPI({
        to: item.email,
        content: dismissInfo,
        recipient: email_info.name,
        subject: `${email_info.type}驳回通知`,
        time: dayjs(Date.now()).format('YYYY年MM月DD日 HH:mm'),
        type: email_info.type,
        url: email_info.url,
      }));
  };

  return (
    <div key={item.id}>
      <div className="text-center text-xs text-[#e0e0e0]">{dayjs(+item.createTime!).format('YYYY-MM-DD HH:mm:ss')}</div>

      <div className="flex justify-between md:p-7 !pt-3 rounded-md transition-colors">
        <div className="flex">
          {item.avatar || item.image ? <img src={item.avatar || item.image} alt="" className="w-13 h-13 border border-stroke rounded-full" /> : <RandomAvatar className="w-13 h-13 border border-stroke rounded-full" />}

          <div className="flex flex-col justify-center ml-4 px-4 py-2 min-w-[210px] text-xs md:text-sm bg-[#F9F9FD] dark:bg-[#4e5969] rounded-md">
            {type === 'link' ? (
              <>
                <div>名称：{item.title}</div>
                <div>介绍：{item.description}</div>
                <div>类型：{item.type.name}</div>
                <div>
                  网站：
                  {item?.url ? (
                    <a href={item?.url} target="_blank" className="hover:text-primary font-bold" rel="noreferrer">
                      {item?.url}
                    </a>
                  ) : (
                    '无网站'
                  )}
                </div>
              </>
            ) : type === 'comment' ? (
              <>
                <div>名称：{item.name}</div>
                <div>内容：{item.content}</div>
                <div>
                  网站：
                  {item?.url ? (
                    <a href={item?.url} target="_blank" className="hover:text-primary font-bold" rel="noreferrer">
                      {item?.url}
                    </a>
                  ) : (
                    '无网站'
                  )}
                </div>
                <div>
                  所属文章：
                  <a href={`${web.url}/article/${item.articleId}`} target="_blank" className="hover:text-primary" rel="noreferrer">
                    {item.articleTitle || '暂无'}
                  </a>
                </div>
              </>
            ) : (
              <>
                <div>名称：{item.name}</div>
                <div>内容：{item.content}</div>
              </>
            )}

            <div>邮箱：{item.email || '暂无'}</div>
          </div>
        </div>

        <div className="flex items-end ml-15">
          <Dropdown
            menu={{
              items:
                type === 'comment' || type === 'wall'
                  ? [
                      { key: 'ok', label: '通过', onClick: handleApproval },
                      { key: 'reply', label: '回复', onClick: () => [setIsModalOpen(true), setBtnType('reply')] },
                      { key: 'dismiss', label: '驳回', onClick: () => [setIsModalOpen(true), setBtnType('dismiss')] },
                    ]
                  : [
                      { key: 'ok', label: '通过', onClick: handleApproval },
                      { key: 'dismiss', label: '驳回', onClick: () => [setIsModalOpen(true), setBtnType('dismiss')] },
                    ],
            }}
          >
            <div className="flex justify-evenly items-center bg-[#F9F9FD] dark:bg-[#4e5969] w-11 h-5 rounded-md cursor-pointer">
              <span className="inline-block w-2 h-2 bg-[#b5c2d3] rounded-full"></span>
              <span className="inline-block w-2 h-2 bg-[#b5c2d3] rounded-full"></span>
            </div>
          </Dropdown>
        </div>
      </div>

      <Modal title={btnType === 'reply' ? '回复内容' : '驳回原因'} open={isModalOpen} footer={null} onCancel={() => setIsModalOpen(false)}>
        <TextArea value={btnType === 'reply' ? replyInfo : dismissInfo} onChange={(e) => (btnType === 'reply' ? setReplyInfo(e.target.value) : setDismissInfo(e.target.value))} placeholder={btnType === 'reply' ? '请输入回复内容' : '请输入驳回原因'} autoSize={{ minRows: 3, maxRows: 5 }} />

        <div className="flex space-x-4">
          <Button className="w-full mt-2" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>
          <Button type="primary" onClick={btnType === 'reply' ? handleReply : handleDismiss} loading={btnLoading} className="w-full mt-2">
            确定
          </Button>
        </div>
      </Modal>
    </div>
  );
};
