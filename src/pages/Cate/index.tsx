import { useEffect, useState } from 'react';
import { Cate } from '@/types/app/cate';
import {
  addCateDataAPI,
  delCateDataAPI,
  editCateDataAPI,
  getCateDataAPI,
  getCateListAPI,
} from '@/api/Cate';
import { DownOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Dropdown,
  Form,
  Input,
  MenuProps,
  message,
  Modal,
  Popconfirm,
  Radio,
  Spin,
  Tree,
} from 'antd';
import Title from '@/components/Title';
import './index.scss';

const CatePage = () => {
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [isModelOpen, setIsModelOpen] = useState(false);
  const [cate, setCate] = useState<Cate>({} as Cate);
  const [list, setList] = useState<Cate[]>([]);
  const [isMethod, setIsMethod] = useState<'create' | 'edit'>('create');
  const [isCateShow, setIsCateShow] = useState(false);
  const [form] = Form.useForm();

  const getCateList = async () => {
    try {
      setLoading(true);

      const { data } = await getCateListAPI();
      data.sort((a, b) => a.order - b.order);
      setList(data);

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getCateList();
  }, []);

  const addCateData = (id: number) => {
    setIsMethod('create');
    setIsModelOpen(true);
    setIsCateShow(false);
    form.resetFields();
    setCate({ ...cate, level: id, type: 'cate' });
  };

  const editCateData = async (id: number) => {
    try {
      setEditLoading(true);

      setIsMethod('edit');
      setIsModelOpen(true);

      const { data } = await getCateDataAPI(id);
      setIsCateShow(data.type !== 'cate');
      setCate(data);
      form.setFieldsValue(data);

      setEditLoading(false);
    } catch (error) {
      setEditLoading(false);
    }
  };

  const delCateData = async (id: number) => {
    try {
      setLoading(true);

      await delCateDataAPI(id);
      await getCateList();
      message.success('🎉 删除分类成功');
    } catch (error) {
      setLoading(false);
    }
  };

  const submit = async () => {
    setBtnLoading(true);

    try {
      form.validateFields().then(async (values: Cate) => {
        if (values.type === 'cate') values.url = '/';

        if (isMethod === 'edit') {
          await editCateDataAPI({ ...cate, ...values });
          message.success('🎉 修改分类成功');
        } else {
          await addCateDataAPI({ ...cate, ...values });
          message.success('🎉 新增分类成功');
        }

        await getCateList();

        // 初始化表单状态
        form.resetFields();
        setCate({} as Cate);

        setIsModelOpen(false);
        setIsMethod('create');
      });

      setBtnLoading(false);
    } catch (error) {
      setBtnLoading(false);
    }
  };

  const closeModel = () => {
    setIsCateShow(false);
    setIsMethod('create');
    setIsModelOpen(false);
    form.resetFields();
    setCate({} as Cate);
  };

  // 将数据转换为树形结构
  const treeData = (data: Cate[]): any[] =>
    data.map((item) => {
      const items: MenuProps['items'] = [
        {
          key: '1',
          label: <span onClick={() => addCateData(item.id!)}>新增</span>,
        },
        {
          key: '2',
          label: <span onClick={() => editCateData(item.id!)}>编辑</span>,
        },
        {
          key: '3',
          label: (
            <Popconfirm
              title="警告"
              description="你确定要删除吗"
              okText="确定"
              cancelText="取消"
              onConfirm={() => delCateData(item.id!)}
            >
              <span>删除</span>
            </Popconfirm>
          ),
        },
      ];

      return {
        title: (
          <div className="group w-full flex justify-between items-center">
            <h3>
              {item.icon} <span className="ml-2">{item.name}</span>
            </h3>

            <Dropdown menu={{ items }} arrow>
              <Button type="link" size="small">
                操作 <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        ),
        key: item.id,
        children: item.children ? treeData(item.children) : [],
      };
    });

  return (
    <div>
      <Title value="分类管理">
        <Button type="primary" size="large" onClick={() => addCateData(0)}>
          新增分类
        </Button>
      </Title>

      <Card
        className={`CatePage [&>.ant-card-body]:!p-[30px_20px] [&>.ant-card-body]:!pb-6 mt-2 min-h-[calc(100vh-180px)]`}
      >
        <Spin spinning={loading}>
          <Tree defaultExpandAll={true} treeData={treeData(list)} />
        </Spin>

        <Modal
          loading={editLoading}
          title={isMethod === 'edit' ? '编辑分类' : '新增分类'}
          open={isModelOpen}
          onCancel={closeModel}
          destroyOnClose
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={cate}
            size="large"
            preserve={false}
            className="mt-6"
          >
            <Form.Item
              label="名称"
              name="name"
              rules={[{ required: true, message: '分类名称不能为空' }]}
            >
              <Input placeholder="请输入分类名称" />
            </Form.Item>

            <Form.Item
              label="标识"
              name="mark"
              rules={[{ required: true, message: '分类标识不能为空' }]}
            >
              <Input placeholder="请输入分类标识" />
            </Form.Item>

            <Form.Item label="图标" name="icon">
              <Input placeholder="请输入分类图标" />
            </Form.Item>

            {isCateShow && (
              <Form.Item label="链接" name="url">
                <Input placeholder="请输入分类链接" />
              </Form.Item>
            )}

            <Form.Item label="顺序" name="order">
              <Input placeholder="请输入分类顺序（值越小越靠前）" />
            </Form.Item>

            <Form.Item label="模式" name="type">
              <Radio.Group
                onChange={(e) => {
                  const type = e.target.value;
                  type === 'nav' ? setIsCateShow(true) : setIsCateShow(false);
                }}
              >
                <Radio value="cate">分类</Radio>
                <Radio value="nav">导航</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item className="!mb-0 w-full">
              <Button
                type="primary"
                onClick={submit}
                loading={btnLoading}
                className="w-full ml-2"
              >
                {isMethod === 'edit' ? '编辑分类' : '新增分类'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default CatePage;
