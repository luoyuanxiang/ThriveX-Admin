import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { Table, Button, Tag, notification, Card, Popconfirm, Form, Input, Select, DatePicker, Modal, message, Pagination, Dropdown } from 'antd';
import { DeleteOutlined, FormOutlined, InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadFileStatus, RcFile } from 'antd/es/upload/interface';
import { ColumnType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

import { titleSty } from '@/styles/sty';
import Title from '@/components/Title';

import { getCateListAPI } from '@/api/Cate';
import { getTagListAPI } from '@/api/Tag';
import { delArticleDataAPI, getArticlePagingAPI, addArticleDataAPI, getArticleListAPI, delBatchArticleDataAPI } from '@/api/Article';

import type { Tag as ArticleTag } from '@/types/app/tag';
import type { Cate } from '@/types/app/cate';
import type { Article, Config, FilterArticle, FilterForm } from '@/types/app/article';

import { useWebStore } from '@/stores';

export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form] = Form.useForm();
  const web = useWebStore((state) => state.web);
  const [articleList, setArticleList] = useState<Article[]>([]);
  const { RangePicker } = DatePicker;

  const [total, setTotal] = useState<number>(0);
  const [paging, setPaging] = useState<Page>({
    page: 1,
    size: 8,
  });
  const [query, setQuery] = useState<FilterArticle>({
    key: undefined,
    cateId: undefined,
    tagId: undefined,
    isDraft: 0,
    isDel: 0,
    startDate: undefined,
    endDate: undefined,
  });

  // 分页获取文章
  const getArticleList = async () => {
    try {
      setLoading(true);
      const { data } = await getArticlePagingAPI({
        pagination: paging,
        query,
      });
      setTotal(data.total);
      setArticleList(data.result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const delArticleData = async (id: number) => {
    try {
      setLoading(true);

      // 普通删除：可从回收站恢复
      await delArticleDataAPI(id, true);
      await getArticleList();
      form.resetFields();
      notification.success({ message: '🎉 删除文章成功' });
      setLoading(false);
    } catch (error) {
      console.error(error);
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
      render: (text: string, record: Article) => (
        <a href={`${web.url}/article/${record.id}`} target="_blank" className="hover:text-primary line-clamp-1" rel="noreferrer">
          {text}
        </a>
      ),
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
      render: (cates: Cate[]) =>
        cates.map((item, index) => (
          <Tag key={item.id} color={colors[index]}>
            {item.name}
          </Tag>
        )),
    },
    {
      title: '标签',
      dataIndex: 'tagList',
      key: 'tagList',
      align: 'center',
      render: (tags: ArticleTag[]) =>
        tags.map((item, index) => (
          <Tag key={item.id} color={colors[index]}>
            {item.name}
          </Tag>
        )),
    },
    {
      title: '浏览量',
      dataIndex: 'view',
      key: 'view',
      align: 'center',
      sorter: (a: Article, b: Article) => a.view! - b.view!,
    },
    {
      title: '评论数量',
      dataIndex: 'comment',
      key: 'comment',
      align: 'center',
      render: (data: string) => <span>{data}</span>,
      sorter: (a: Article, b: Article) => a.comment! - b.comment!,
    },
    {
      title: '状态',
      dataIndex: 'config',
      key: 'config',
      align: 'center',
      render: (config: Config) => (config.status === 'default' && <span>正常</span>) || (config.status === 'no_home' && <span>不在首页显示</span>) || (config.status === 'hide' && <span>隐藏</span>) || (config.password.trim().length && <span>文章加密</span>),
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 200,
      render: (text: string) => dayjs(+text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: Article, b: Article) => +a.createTime! - +b.createTime!,
      showSorterTooltip: false,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      render: (_: string, record: Article) => (
        <div className="flex justify-center space-x-2">
          <Popconfirm title="提醒" description="你确定要导出吗" okText="确定" cancelText="取消" onConfirm={() => exportArticle(record.id!)}>
            <Button type="primary" icon={<DownloadOutlined />} />
          </Popconfirm>

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
      setPaging({
        ...paging,
        page: 1,
      });

      setQuery({
        key: values.title,
        cateId: values.cateId,
        tagId: values.tagId,
        startDate: values.createTime && values.createTime[0].valueOf() + '',
        endDate: values.createTime && values.createTime[1].valueOf() + '',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const [cateList, setCateList] = useState<Cate[]>([]);
  const [tagList, setTagList] = useState<ArticleTag[]>([]);

  const getCateList = async () => {
    const { data } = await getCateListAPI();
    setCateList(data.filter((item) => item.type === 'cate') as Cate[]);
  };

  const getTagList = async () => {
    const { data } = await getTagListAPI();
    setTagList(data as ArticleTag[]);
  };

  // 导入文章
  const handleArticleImport = async () => {
    if (fileList.length === 0) {
      notification.warning({ message: '请上传至少一个 .md 或 .json 文件' });
      return;
    }

    try {
      setLoading(true);
      setImportLoading(true);

      const articles: Article[] = [];

      for (const fileItem of fileList) {
        const file = fileItem.originFileObj as File;
        const text = await file.text();

        if (file.name.endsWith('.md')) {
          const article = await parseMarkdownToArticle(text);
          articles.push(article);
        } else if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          const article = parseJsonToArticles(json); // 可能需要适配结构
          articles.concat(article);
        }
      }

      if (articles.length === 0) return notification.error({ message: '解析失败，未提取出有效文章数据' });

      articles.forEach(async (article: Article) => {
        try {
          const { code } = await addArticleDataAPI(article);
          if (code === 200) {
            message.success(`${article.title}--导入成功~`);
          }
        } catch (error) {
          console.error(error);
          message.error(`${article.title}--导入失败~`);
        }
      });

      await getArticleList();

      setFileList([]);
      setIsModalOpen(false);

      notification.success({
        message: `🎉 成功导入 ${articles.length} 篇文章`,
      });
    } catch (err) {
      console.error(err);
      notification.error({ message: '导入失败，请检查文件格式或控制台报错' });
    } finally {
      setImportLoading(false);
      setLoading(false);
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
    const validFiles = files.filter((file) => file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.json'));

    if (validFiles.length === 0) {
      message.error('仅支持 Markdown(.md) 或 JSON(.json) 文件');
      return;
    }

    if (fileList.length + validFiles.length > 5) {
      message.error('最多只能上传 5 个文件');
      return;
    }

    const newFileList: UploadFile[] = validFiles.map((file) => {
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
    message.success(`成功添加 ${validFiles.length} 个文件`);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter((file) => file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.json'));

    if (validFiles.length === 0) {
      message.error('仅支持 Markdown(.md) 或 JSON(.json) 文件');
      return;
    }

    if (fileList.length + validFiles.length > 5) {
      message.error('最多只能上传 5 个文件');
      return;
    }

    const newFileList: UploadFile[] = validFiles.map((file) => {
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
    // 允许重复上传同一文件
    e.target.value = '';
  };

  // 导出为markdown文件
  const generateMarkdown = (article: Article) => {
    const { title, description, content, cover, createTime, cateList, tagList } = article;

    // 格式化时间为 `YYYY-MM-DD HH:mm:ss`
    const formatDate = (timestamp: string) => {
      const date = new Date(Number(timestamp));
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    // 处理标签、分类
    const tags = (tagList || []).map((tag) => tag.name);
    const categories = (cateList || []).map((cate) => cate.name);
    const keywords = [...tags, ...categories].join(' ');

    // 构建 Markdown 字符串
    const markdown = `---\ntitle: ${title}\ntags: ${tags.map((tag) => `${tag}`).join(' ')}\ncategories: ${categories.map((c) => `${c}`).join(' ')}\ncover: ${cover}\ndate: ${formatDate(createTime || new Date().getTime() + '')}\nkeywords: ${keywords}\ndescription: ${description}\n---\n\n ${content.trim()}`;

    return markdown;
  };
  /**
   * 根据 tag 名称列表获取对应的 ID 列表
   * @param names - Markdown 里解析出的标签 ["模块", "爬虫"]
   * @param allTags - 全部可用 tag 列表
   * @returns 标签 ID 数组，如 [82, 87]
   */
  const getTagIdsByNames = (names: string[], allTags: { id?: number; name: string }[]) => {
    const lowerCaseMap = new Map<string, number>();

    // 可选：忽略大小写（如果不需要，请移除 toLowerCase）
    for (const tag of allTags) {
      lowerCaseMap.set(tag.name.toLowerCase(), tag.id as number);
    }

    return (
      names
        .map((name) => lowerCaseMap.get(name.toLowerCase()))
        // 去除未匹配项
        .filter((id): id is number => id !== undefined)
    );
  };

  // 从 markdown 字符串解析为 Article JSON
  const parseMarkdownToArticle = (mdText: string): Article => {
    // 提取 frontmatter 块
    const frontmatterMatch = mdText.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) throw new Error('Markdown 文件格式错误，缺少 frontmatter');

    const frontmatterText = frontmatterMatch[1];
    // 去除 frontmatter 后的正文
    const content = mdText.replace(frontmatterMatch[0], '').trim();

    const meta: Record<string, string> = {};

    // 解析 frontmatter 每一行 key: value
    frontmatterText.split('\n').forEach((line) => {
      const [key, ...rest] = line.split(':');
      meta[key.trim()] = rest.join(':').trim();
    });

    // 时间戳（从 YYYY-MM-DD HH:mm:ss 转为 timestamp）
    const parseDateToTimestamp = (str: string): string => {
      const d = new Date(str);
      if (isNaN(d.getTime())) return Date.now().toString();
      return d.getTime().toString();
    };
    const tagNames = meta.tags?.split(/\s+/).filter(Boolean) || [];
    const tagIds = getTagIdsByNames(tagNames, tagList);
    const cateNames = meta.categories?.split(/\s+/).filter(Boolean) || [];
    const cateIds = getTagIdsByNames(cateNames, cateList);

    const article: Article = {
      title: meta.title || '未命名文章',
      description: meta.description || '',
      content,
      cover: meta.cover || '',
      createTime: parseDateToTimestamp(meta.date || ''),
      cateIds,
      tagIds,
      config: {
        status: 'default',
        password: '',
        isDraft: 0,
        isEncrypt: 0,
        isDel: 0,
      },
    };

    return article;
  };

  // 解析 JSON 内容为文章数据列表
  const parseJsonToArticles = (raw: Article | Article[]): Article[] => {
    const parseSingle = (item: Article): Article => ({
      title: item.title || '未命名文章',
      description: item.description || '',
      content: item.content || '',
      cover: item.cover || '',
      createTime: item.createTime,
      cateIds: (item.cateList || []).map((cate) => cate.id).filter((id): id is number => id !== undefined),
      tagIds: (item.tagList || []).map((tag) => tag.id).filter((id): id is number => id !== undefined),
      config: {
        status: item.config?.status || 'default',
        password: item.config?.password || '',
        isDraft: item.config?.isDraft || 0,
        isEncrypt: item.config?.isEncrypt || 0,
        isDel: item.config?.isDel || 0,
      },
    });

    // 如果是数组则批量解析，否则解析单个
    return Array.isArray(raw) ? raw.map(parseSingle) : [parseSingle(raw)];
  };

  // 下载文件
  const downloadFile = (content: string, fileName: string, mimeType: string = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 导出文章为 zip 文件
  const downloadMarkdownZip = async (articles: Article[]) => {
    const zip = new JSZip();
    const folder = zip.folder('data');

    articles.forEach((article) => {
      const markdown = generateMarkdown(article);
      const safeTitle = article.title.replace(/[\\/:*?"<>|]/g, '_');
      folder?.file(`${safeTitle}.md`, markdown);
    });
    zip.file('articles.json', JSON.stringify(articles, null, 2));
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, '导出文章_' + new Date().getTime() + '.zip');
  };

  // 导出文章
  const exportArticle = (id: number) => {
    const article = articleList.filter((item) => item.id === id)[0];
    const markdown = generateMarkdown(article);
    downloadFile(markdown, `${article.title.replace(/[\\/:*?"<>|]/g, '_')}.md`);
  };

  // 导出选中
  const exportSelected = () => {
    const selectedArticles = articleList.filter((item: Article) => selectedRowKeys.includes(item.id as number));

    if (!selectedArticles.length) return message.warning('请选择要导出的文章');

    downloadMarkdownZip(selectedArticles);
  };

  // 删除选中
  const delSelected = async () => {
    if (!selectedRowKeys.length) {
      message.warning('请选择要删除的文章');
      return;
    }

    try {
      setLoading(true);
      const { code } = await delBatchArticleDataAPI(selectedRowKeys as number[]);
      if (code === 200) {
        message.success('删除成功');
        await getArticleList();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 选择行
  const rowSelection: TableRowSelection<Article> = {
    selectedRowKeys,
    onChange: onSelectChange,
    fixed: 'left',
  };

  // 全部导出
  const exportAll = async () => {
    try {
      setLoading(true);
      const { data } = await getArticleListAPI({});
      downloadMarkdownZip(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Markdown 模板
  const downloadMarkdownTemplate = () => {
    const content = `---\ntitle: 示例文章标题\ndescription: 这里是文章描述\ntags: 示例标签1 示例标签2\ncategories: 示例分类\ncover: https://example.com/image.png\ndate: 2025-07-12 12:00:00\nkeywords: 示例标签1 示例标签2 示例分类\n---\n\n这里是 Markdown 正文内容，请开始创作吧~`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '文章模板.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON 模板
  const downloadJsonTemplate = () => {
    const data = {
      title: '示例文章标题',
      description: '文章描述',
      content: '# 正文内容',
      cover: '',
      createTime: Date.now().toString(),
      cateList: [{ id: 1, name: '示例分类' }],
      tagList: [{ id: 2, name: '示例标签' }],
      config: {
        status: 'default',
        password: '',
        isDraft: 0,
        isEncrypt: 0,
        isDel: 0,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = '文章模板.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    getArticleList();
  }, [paging, query]);

  useEffect(() => {
    getArticleList();
    getCateList();
    getTagList();
  }, []);

  return (
    <div>
      <Title value="文章管理" />

      <Card className="my-2 overflow-scroll">
        <div className="w-full flex justify-between">
          <Form form={form} layout="inline" onFinish={onFilterSubmit} autoComplete="off" className="flex-nowrap">
            <Form.Item label="标题" name="title" className="min-w-[200px]">
              <Input placeholder="请输入关键词" />
            </Form.Item>

            <Form.Item label="分类" name="cateId" className="min-w-[200px]">
              <Select allowClear options={cateList} fieldNames={{ label: 'name', value: 'id' }} placeholder="请选择分类" />
            </Form.Item>

            <Form.Item label="标签" name="tagId" className="min-w-[200px]">
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

            <Form.Item label="时间范围" name="createTime" className="min-w-[250px]">
              <RangePicker placeholder={['选择起始时间', '选择结束时间']} />
            </Form.Item>

            <Form.Item className="pr-6">
              <Button type="primary" htmlType="submit">
                筛选
              </Button>
            </Form.Item>
          </Form>

          <div className="flex space-x-3 pl-32 pr-10">
            <Dropdown.Button
              menu={{
                items: [
                  {
                    label: '导出选中',
                    key: 'exportSelected',
                    onClick: () => exportSelected(),
                  },
                  {
                    label: '导出全部',
                    key: 'exportAll',
                    onClick: () => exportAll(),
                  },
                ],
              }}
            >
              导出文章
            </Dropdown.Button>

            <Button type="primary" className="mr-1" onClick={() => setIsModalOpen(true)}>
              导入文章
            </Button>

            <Popconfirm title="警告" description="你确定要删除选中的文章吗" okText="确定" cancelText="取消" onConfirm={() => delSelected()}>
              <Button type="primary" danger>
                删除选中
              </Button>
            </Popconfirm>
          </div>
        </div>
      </Card>

      <Modal
        title="导入文章"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,

          <Button key="import" type="primary" onClick={handleArticleImport} loading={importLoading} disabled={fileList.length === 0}>
            开始导入
          </Button>,
        ]}
      >
        <div className="py-4">
          <div onClick={() => fileInputRef?.current?.click()} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`w-full h-40 p-4 border border-dashed rounded-lg transition-all duration-300 ${isDragging ? 'border-primary bg-primary/5' : 'border-[#D7D7D7] hover:border-primary bg-[#FAFAFA]'} space-y-2 cursor-pointer`}>
            <div className="flex justify-center">
              <InboxOutlined className="text-5xl text-primary" />
            </div>

            <p className="text-base text-center">{isDragging ? '文件放在此处即上传' : '点击或拖动文件到此区域'}</p>

            <p className="text-sm text-[#999] text-center">仅支持 Markdown 或 JSON 格式</p>
          </div>

          <input multiple type="file" onChange={handleFileInput} ref={fileInputRef} className="hidden" accept=".md" placeholder="请选择 Markdown 格式文件" />

          {fileList.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">已选择的文件：</p>
              <ul className="space-y-2">
                {fileList.map((file) => (
                  <li key={file.uid} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{file.name}</span>

                    <Button type="text" danger size="small" onClick={() => setFileList(fileList.filter((f) => f.uid !== file.uid))}>
                      删除
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fileList.length === 0 && (
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <span>你可以下载模板后填写再导入：</span>

              <div className="space-x-2">
                <Button type="link" size="small" onClick={downloadMarkdownTemplate}>
                  下载 Markdown 模板
                </Button>
                <Button type="link" size="small" onClick={downloadJsonTemplate}>
                  下载 JSON 模板
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Card className={`${titleSty} min-h-[calc(100vh-250px)]`}>
        <Table rowKey="id" rowSelection={rowSelection} dataSource={articleList} columns={columns} pagination={false} loading={loading} scroll={{ x: 'max-content' }} className="[&_.ant-table-selection-column]:w-18" />

        <div className="flex justify-center my-5">
          <Pagination total={total} current={paging.page} pageSize={paging.size} onChange={(page, pageSize) => setPaging({ ...paging, page, size: pageSize })} />
        </div>
      </Card>
    </div>
  );
};
