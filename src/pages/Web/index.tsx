import { useEffect, useState } from 'react';

import { Button, Card, Empty, Form, Input, Popconfirm, Select, Spin, Tabs, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { getLinkListAPI, addLinkDataAPI, editLinkDataAPI, delLinkDataAPI, getWebTypeListAPI, getWebsiteInfoAPI } from '@/api/Web';
import Title from '@/components/Title';
import { WebType, Web } from '@/types/app/web';
import { RuleObject } from 'antd/es/form';

import group from './assets/svg/group.svg';
import './index.scss';
import Search from 'antd/es/input/Search';
import { SearchProps } from 'antd/lib/input';

export default () => {
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [form] = Form.useForm();

  const [tab, setTab] = useState<string>('list');
  const [list, setList] = useState<{ [key: string]: Web[] }>({});
  const [listTemp, setListTemp] = useState<Web[]>([]);
  const [typeList, setTypeList] = useState<WebType[]>([]);
  const [search, setSearch] = useState<string>('');
  const [link, setLink] = useState<Web>({} as Web);

  // 区分新增或编辑
  const [isMethod, setIsMethod] = useState<'create' | 'edit'>('create');

  // 获取网站列表
  const getLinkList = async () => {
    try {
      setLoading(true);

      const { data } = await getLinkListAPI();
      data.sort((a, b) => a.order - b.order);
      data.sort((a, b) => a.type.order - b.type.order);

      const grouped = data.reduce(
        (acc, item) => {
          const groupName = item.type.name;
          if (!acc[groupName]) {
            acc[groupName] = [];
          }
          acc[groupName].push(item);
          return acc;
        },
        {} as { [key: string]: Web[] },
      );

      setList(grouped);
      setListTemp(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // 获取网站类型列表
  const getWebTypeList = async () => {
    const { data } = await getWebTypeListAPI();
    setTypeList(data);
  };

  useEffect(() => {
    getLinkList();
    getWebTypeList();
  }, []);

  useEffect(() => {
    // 过滤出符合搜索条件的网站
    const filteredList = listTemp.filter((item) => item.title.includes(search) || item.description.includes(search));

    // 按类型分组
    const grouped = filteredList.reduce(
      (acc, item) => {
        const groupName = item.type.name;
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(item);
        return acc;
      },
      {} as { [key: string]: Web[] },
    );

    setList(grouped);
  }, [search, listTemp]);

  const deleteLinkData = async (id: number) => {
    try {
      setLoading(true);

      await delLinkDataAPI(id);
      getLinkList();
      message.success('🎉 删除网站成功');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const editLinkData = async (record: Web) => {
    try {
      setEditLoading(true);
      setTab('operate');
      setIsMethod('edit');

      setLink(record);

      form.setFieldsValue(record);
      setEditLoading(false);
    } catch (error) {
      console.error(error);
      setEditLoading(false);
    }
  };

  // 做一些初始化的事情
  const reset = () => {
    form.resetFields(); // 重置表单字段
    setLink({} as Web);
    setIsMethod('create');
  };

  // 校验网站链接
  const validateURL = (_: RuleObject, value: string) => {
    return !value || /^(https?:\/\/)/.test(value) ? Promise.resolve() : Promise.reject(new Error('请输入有效的链接'));
  };

  const onSubmit = async () => {
    try {
      setBtnLoading(true);

      form.validateFields().then(async (values: Web) => {
        if (isMethod === 'edit') {
          await editLinkDataAPI({ ...link, ...values });
          message.success('🎉 编辑网站成功');
        } else {
          await addLinkDataAPI({ ...values, createTime: new Date().getTime().toString() });
          message.success('🎉 新增网站成功');
        }

        await getLinkList();
        reset();
        setTab('list');
      });

      setBtnLoading(false);
    } catch (error) {
      console.error(error);
      setBtnLoading(false);
    }
  };

  const { Option } = Select;

  const handleTabChange = (key: string) => {
    setTab(key);
    reset();
  };

  const toHref = (url: string) => {
    window.open(url, '_blank');
  };

  // 获取网站信息
  const onSearch: SearchProps['onSearch'] = async (value: string) => {
    if (!value) return
    const {data} = await getWebsiteInfoAPI(value)
    form.setFieldsValue(data)
  }

  const tabItems = [
    {
      label: '网站列表',
      key: 'list',
      children: (
        <div>
          <div className="flex justify-end w-full mb-8">
            <Input size="large" placeholder="请输入网站名称或描述信息进行查询" prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} className="w-[400px]" />
          </div>

          <Spin spinning={loading}>
            <div className="space-y-8">
              {Object.keys(list).map((key, index1) => (
                <div key={index1}>
                  <Card className="[&>.ant-card-body]:flex [&>.ant-card-body]:py-2 [&>.ant-card-body]:px-4 my-2 ml-1.5 text-base bg-[#f5f6ff] dark:bg-boxdark transition-colors">
                    <img src={group} alt="分组图标" className="w-6 h-6 mr-2" />
                    <span>{key}</span>
                  </Card>

                  {Object.values(list[key]).length ? (
                    <div className="list">
                      {Object.values(list[key]).map((item, index2) => (
                        <div key={index2} className="item">
                          <div className="avatar">
                            <img src={item.image} alt="" className="avatar-img" />
                          </div>

                          <div className="name">{item.title}</div>
                          <div className="description">{item.description}</div>
                          <div className="type">{item.type.name}</div>

                          <div className="operate">
                            <div onClick={() => editLinkData(item)} className="edit">
                              修改
                            </div>

                            <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => deleteLinkData(item.id!)}>
                              <div className="delete">删除</div>
                            </Popconfirm>
                          </div>

                          <div onClick={() => toHref(item.url)} className="headFor">
                            前往该网站 &rarr;
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="暂无数据" className="my-7" />
                  )}
                </div>
              ))}
            </div>
          </Spin>
        </div>
      ),
    },
    {
      label: isMethod === 'edit' ? '编辑网站' : '新增网站',
      key: 'operate',
      children: (
        <div>
          <h2 className="text-xl pb-4 text-center">{isMethod === 'edit' ? '编辑网站' : '新增网站'}</h2>

          <Spin spinning={editLoading}>
            <div className="w-full md:w-[500px] mx-auto">
              <Form form={form} layout="vertical" size="large" initialValues={link} onFinish={onSubmit}>

                <Form.Item label="网站链接" name="url" rules={[{ required: true, message: '网站链接不能为空' }, { validator: validateURL }]}>
                  <Search placeholder="https://liuyuyang.net/" allowClear onSearch={onSearch} />
                </Form.Item>

                <Form.Item label="网站标题" name="title" rules={[{ required: true, message: '网站标题不能为空' }]}>
                  <Input placeholder="ThriveX" />
                </Form.Item>

                <Form.Item label="网站描述" name="description" rules={[{ required: true, message: '网站描述不能为空' }]}>
                  <Input placeholder="记录前端、Python、Java点点滴滴" />
                </Form.Item>

                <Form.Item label="站长邮箱" name="email">
                  <Input placeholder="3311118881@qq.com" />
                </Form.Item>

                <Form.Item label="网站图标" name="image" rules={[{ required: true, message: '网站图标不能为空' }]}>
                  <Input placeholder="https://liuyuyang.net/logo.png" />
                </Form.Item>

                <Form.Item label="订阅地址" name="rss" rules={[{ validator: validateURL }]}>
                  <Input placeholder="https://liuyuyang.net/api/rss" />
                </Form.Item>

                <Form.Item name="typeId" label="网站类型" rules={[{ required: true, message: '网站类型不能为空' }]}>
                  <Select placeholder="请选择网站类型" allowClear>
                    {typeList.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="顺序" name="order">
                  <Input placeholder="请输入网站顺序（值越小越靠前）" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">
                    {isMethod === 'edit' ? '编辑网站' : '新增网站'}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Spin>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title value="网站管理" />

      <Card className="WebPage mt-2 min-h-[calc(100vh-160px)]">
        <Tabs activeKey={tab} tabPosition="top" onChange={handleTabChange} items={tabItems} />
      </Card>
    </div>
  );
};
