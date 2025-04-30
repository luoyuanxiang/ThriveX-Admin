import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, Drawer, Dropdown, MenuProps, message, Spin } from 'antd';

import Title from '@/components/Title';
import Editor from './components/Editor';
import PublishForm from './components/PublishForm';

import { Article } from '@/types/app/article';
import { getArticleDataAPI } from '@/api/Article';

import { BiSave } from 'react-icons/bi';
import { AiOutlineEdit, AiOutlineSend } from 'react-icons/ai';
import { titleSty } from '@/styles/sty';
import { processDocument, getAssistantListAPI } from '@/api/Assistant.ts';
import { Assistant } from '@/types/app/assistant';

export default () => {
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const id = +params.get('id')!;
  const isDraftParams = Boolean(params.get('draft'));
  const [data, setData] = useState<Article>({} as Article);
  const [content, setContent] = useState('');
  const [publishOpen, setPublishOpen] = useState(false);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(
    null,
  );

  useEffect(() => {
    getAssistantList();
  }, []);

  const getAssistantList = async () => {
    try {
      const { data } = await getAssistantListAPI();
      setAssistants(data);
      setSelectedAssistant(data[0]);
      console.log('获取助手列表成功', assistants);
    } catch (error) {
      console.error('获取助手列表失败', error);
    }
  };

  // 下一步
  const nextBtn = () => {
    content.trim().length >= 1
      ? setPublishOpen(true)
      : message.error('请输入文章内容');
  };

  // 获取文章数据
  const getArticleData = async () => {
    try {
      setLoading(true);

      const { data } = await getArticleDataAPI(id);
      setData(data);
      setContent(data.content);

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // 回显数据
  useEffect(() => {
    setPublishOpen(false);

    // 有Id就回显指定的数据
    if (id) {
      getArticleData();
      return;
    }

    // 没有就回显本地保存的数据
    const content = localStorage.getItem('article_content');

    if (content) {
      setData({ ...data, content });
      setContent(content);
    }
  }, [id]);

  // 保存文章
  const saveBtn = () => {
    if (content.trim().length >= 1) {
      // 将文章内容持久化存储到本地
      localStorage.setItem('article_content', content);
      message.success('内容已保存');
    } else {
      message.error('请输入文章内容');
    }
  };

  useEffect(() => {
    setData({ ...data, content });

    // 点击快捷键保存文章
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // 阻止默认的保存行为
        saveBtn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [content]);

  // 助手功能菜单
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: '续写',
      onClick: async () => {
        try {
          setLoading(true);
          const reader = await processDocument({
            content: content,
            operation: 'continue',
          });
          if (!reader) return;

          setContent(content + reader);
        } catch (error) {
          message.error('调用助手失败');
        } finally {
          setLoading(false);
        }
      },
    },
    {
      key: '2',
      label: '优化',
      onClick: async () => {
        try {
          setLoading(true);
          const reader = await processDocument({
            content: content,
            operation: 'optimize',
          });
          if (!reader) return;
          // @ts-ignore
          setContent(reader);
        } catch (error) {
          message.error('调用助手失败');
        } finally {
          setLoading(false);
        }
      },
    },
    {
      key: '3',
      label: '重写',
      onClick: async () => {
        try {
          setLoading(true);
          const reader = await processDocument({
            content: content,
            operation: 'rewrite',
          });
          if (!reader) return;
          // @ts-ignore
          setContent(reader);
        } catch (error) {
          message.error('调用助手失败');
        } finally {
          setLoading(false);
        }
      },
    },
    {
      key: '4',
      label: '翻译为英文',
      onClick: async () => {
        try {
          setLoading(true);
          const reader = await processDocument({
            content: content,
            operation: 'translate',
          });
          if (!reader) return;
          // @ts-ignore
          setContent(reader);
        } catch (error) {
          message.error('调用助手失败');
        } finally {
          setLoading(false);
        }
      },
    },
    {
      key: '5',
      label: '翻译为中文',
      onClick: async () => {
        try {
          setLoading(true);
          const reader = await processDocument({
            content: content,
            operation: 'translate_zh',
          });
          if (!reader) return;
          // @ts-ignore
          setContent(reader);
        } catch (error) {
          message.error('调用助手失败');
        } finally {
          setLoading(false);
        }
      },
    },
  ];

  return (
    <div>
      <Title value="创作">
        <div className="flex items-center space-x-4 w-[360px]">
          <Dropdown.Button
            menu={{ items }}
            onClick={() => {
              if (assistants.length === 0) {
                message.error('请先在助手管理中添加助手');
              }
            }}
          >
            <AiOutlineEdit className="text-base" />
            {selectedAssistant
              ? selectedAssistant.name || '选择助手'
              : '选择助手'}
          </Dropdown.Button>

          <Button className="w-full flex justify-between" onClick={saveBtn}>
            <BiSave className="text-base" /> 保存
          </Button>

          <Button
            size="large"
            type="primary"
            className="w-full flex justify-between"
            onClick={nextBtn}
          >
            <AiOutlineSend className="text-2xl" /> 发布
          </Button>
        </div>
      </Title>

      <Spin spinning={loading}>
        <Card
          className={`${titleSty} overflow-hidden rounded-xl min-h-[calc(100vh-180px)]`}
        >
          <Editor value={content} onChange={(value) => setContent(value)} />

          <Drawer
            title={id && !isDraftParams ? '编辑文章' : '发布文章'}
            placement="right"
            size="large"
            onClose={() => setPublishOpen(false)}
            open={publishOpen}
          >
            <PublishForm data={data} closeModel={() => setPublishOpen(false)} />
          </Drawer>
        </Card>
      </Spin>
    </div>
  );
};
