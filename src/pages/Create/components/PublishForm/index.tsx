import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Form, Input, Button, Select, DatePicker, Cascader, message, Switch, Radio } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { RuleObject } from 'antd/es/form';
import dayjs from 'dayjs';
import { CloudUploadOutlined, PictureOutlined } from '@ant-design/icons';

import { addArticleDataAPI, editArticleDataAPI } from '@/api/Article';
import { getCateListAPI } from '@/api/Cate';
import useAssistant from '@/hooks/useAssistant';
import { addTagDataAPI, getTagListAPI } from '@/api/Tag';

import { Cate } from '@/types/app/cate';
import { Tag } from '@/types/app/tag';
import { Article, Status } from '@/types/app/article';

import Material from '@/components/Material';

interface Props {
  data: Article;
  closeModel: () => void;
}

interface FieldType {
  title: string;
  createTime: number;
  cateIds: number[];
  tagIds: (number | string)[];
  cover: string;
  description: string;
  config: {
    top: boolean;
    status: Status;
    password: string;
    isEncrypt: number;
  };
}

interface AssistantResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const PublishForm = ({ data, closeModel }: Props) => {
  const [params] = useSearchParams();
  const id = +params.get('id')!;
  const isDraftParams = Boolean(params.get('draft'));

  const [btnLoading, setBtnLoading] = useState(false);

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [cateList, setCateList] = useState<Cate[]>([]);
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [isEncryptEnabled, setIsEncryptEnabled] = useState(false);

  useEffect(() => {
    if (!id) return form.resetFields();

    // 把数据处理成[[1], [4, 5], [4, 6]]格式
    const cateIds = data?.cateList?.flatMap((item) => {
      if (item?.children?.length) {
        return item.children.map((child) => [item.id, child.id]);
      } else {
        return [[item.id]];
      }
    });

    const tagIds = data.tagList!.map((item) => item.id);

    const formValues = {
      ...data,
      status: data.config.status,
      password: data.config.password,
      isEncrypt: !!data.config.isEncrypt,
      cateIds,
      tagIds,
      createTime: dayjs(+data.createTime!),
    };

    form.setFieldsValue(formValues);
    // 设置初始的加密状态
    setIsEncryptEnabled(!!formValues.isEncrypt);
  }, [data, id]);

  const getCateList = async () => {
    const { data } = await getCateListAPI();
    setCateList(data.filter((item) => item.type === 'cate') as Cate[]);
  };

  const getTagList = async () => {
    const { data } = await getTagListAPI();
    setTagList(data as Tag[]);
  };

  useEffect(() => {
    getCateList();
    getTagList();
  }, []);

  // 校验文章封面
  const validateURL = (_: RuleObject, value: string) => {
    return !value || /^(https?:\/\/)/.test(value) ? Promise.resolve() : Promise.reject(new Error('请输入有效的封面链接'));
  };

  const onSubmit = async (values: FieldType, isDraft?: boolean) => {
    setBtnLoading(true);

    values.config.isEncrypt = values.config.isEncrypt ? 1 : 0;

    try {
      // 如果是文章标签，则先判断是否存在，如果不存在则添加
      const tagIds: number[] = [];
      for (const item of values.tagIds ? values.tagIds : []) {
        if (typeof item === 'string') {
          // 如果已经有这个标签了，就没必要再创建一个了
          // 先转换为大写进行查找，否则会出现大小写不匹配问题
          const tag1 = tagList.find((t) => t.name.toUpperCase() === item.toUpperCase())?.id;

          if (tag1) {
            tagIds.push(tag1);
            continue;
          }

          await addTagDataAPI({ name: item });
          const { data: list } = await getTagListAPI();
          // 添加成功后查找对应的标签id
          const tag2 = list.find((t) => t.name === item)?.id;
          if (tag2) tagIds.push(tag2);
        } else {
          tagIds.push(item);
        }
      }

      values.createTime = values.createTime.valueOf();
      values.cateIds = [...new Set(values.cateIds?.flat())];

      if (id && !isDraftParams) {
        await editArticleDataAPI({
          id,
          ...values,
          content: data.content,
          tagIds,
          createTime: values.createTime.toString(),
          config: {
            isDraft: 0,
            isDel: 0,
            ...values.config,
          },
        } as Article);
        message.success('🎉 编辑成功');
      } else {
        if (!isDraftParams) {
          await addArticleDataAPI({
            id,
            ...values,
            content: data.content,
            tagIds,
            config: {
              isDraft: isDraft ? 1 : 0,
              isDel: 0,
              ...values.config,
            },
            createTime: values.createTime.toString(),
          });

          if (isDraft) {
            message.success('🎉 保存为草稿成功');
          } else {
            message.success('🎉 发布成功');
          }
        } else {
          // 修改草稿状态为发布文章
          await editArticleDataAPI({
            id,
            ...values,
            content: data.content,
            tagIds,
            createTime: values.createTime.toString(),
            config: {
              isDraft: isDraft ? 1 : 0,
              isDel: 0,
              ...values.config,
            },
          } as Article);
        }
      }

      // 关闭弹框
      closeModel();
      // 清除本地持久化的数据
      localStorage.removeItem('article_content');
      // 如果是草稿就跳转到草稿页，否则文章页
      if (isDraft) {
        navigate('/draft');
      } else {
        navigate('/article');
      }
      // 初始化表单
      form.resetFields();
    } catch (error) {
      console.error(error);
      setBtnLoading(false);
    }

    setBtnLoading(false);
  };

  // 初始表单数据
  const initialValues = {
    config: {
      top: false,
      status: 'default',
      password: '',
      isEncrypt: 0,
    },
    createTime: dayjs(new Date()),
  };

  const { callAssistant } = useAssistant();
  const [generating, setGenerating] = useState(false);

  // 调用助手API生成标题和简介
  const generateTitleAndDescription = async () => {
    try {
      setGenerating(true);

      const content = data.content || '';
      if (!content) {
        message.error('请先输入文章内容');
        return;
      }

      const prompt = `请根据以下文章内容生成一个合适的标题和简短的简介：
文章内容：
${content}

要求：
1. 标题要简洁有力，不超过20个字
2. 简介要概括文章主要内容，不超过100字
3. 返回格式为JSON对象，包含title和description字段`;

      const response = await callAssistant(
        [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。',
          },
          { role: 'user', content: prompt },
        ],
        { max_tokens: 200, temperature: 0.3 },
      );

      if (response) {
        const result = (response as AssistantResponse).choices?.[0]?.message?.content?.trim();
        if (result) {
          try {
            let jsonStr = result;
            if (jsonStr.startsWith('```json')) {
              jsonStr = jsonStr
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            }

            const { title, description } = JSON.parse(jsonStr);
            form.setFieldsValue({
              title: title || '',
              description: description || '',
            });
            message.success('标题和简介生成成功');
          } catch (e) {
            console.error('Failed to parse response:', e);
            message.error('解析生成结果失败，请检查助手返回格式');
          }
        } else {
          message.error('生成失败，请重试');
        }
      }
    } catch (error) {
      console.error(error);
      message.error('调用助手失败');
    } finally {
      setGenerating(false);
    }
  };

  // 文件上传
  const UploadBtn = () => <CloudUploadOutlined className="text-xl cursor-pointer" onClick={() => setIsMaterialModalOpen(true)} />;

  return (
    <div>
      <Form form={form} name="basic" size="large" layout="vertical" onFinish={onSubmit} autoComplete="off" initialValues={initialValues}>
        <Form.Item label="文章标题" name="title" rules={[{ required: true, message: '请输入文章标题' }]}>
          <Input placeholder="请输入文章标题" />
        </Form.Item>

        <Form.Item label="文章简介" name="description">
          <TextArea autoSize={{ minRows: 2, maxRows: 5 }} showCount placeholder="请输入文章简介" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={generateTitleAndDescription} loading={generating}>
            一键生成标题和简介
          </Button>
        </Form.Item>

        <Form.Item label="文章封面" name="cover" rules={[{ validator: validateURL }]}>
          <Input placeholder="请输入文章封面" prefix={<PictureOutlined />} addonAfter={<UploadBtn />} className="customizeAntdInputAddonAfter" />
        </Form.Item>

        <Form.Item label="选择分类" name="cateIds" rules={[{ required: true, message: '请选择文章分类' }]}>
          <Cascader options={cateList} maxTagCount="responsive" multiple fieldNames={{ label: 'name', value: 'id' }} placeholder="请选择文章分类" className="w-full" />
        </Form.Item>

        <Form.Item label="选择标签" name="tagIds">
          <Select allowClear mode="tags" options={tagList} fieldNames={{ label: 'name', value: 'id' }} filterOption={(input, option) => !!option?.name.includes(input)} placeholder="请选择文章标签" className="w-full" />
        </Form.Item>

        <Form.Item label="选择发布时间" name="createTime">
          <DatePicker showTime placeholder="选择文章发布时间" className="w-full" />
        </Form.Item>

        {/* <Form.Item label="是否置顶" name={["config", "top"]} valuePropName="checked">
          <Switch />
        </Form.Item> */}

        <Form.Item label="状态" name={['config', 'status']}>
          <Radio.Group>
            <Radio value="default">正常</Radio>
            <Radio value="no_home">不在首页显示</Radio>
            <Radio value="hide">全站隐藏</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="是否加密" name={['config', 'isEncrypt']} valuePropName="checked">
          <Switch onChange={(checked: boolean) => setIsEncryptEnabled(checked)} />
        </Form.Item>

        {isEncryptEnabled && (
          <Form.Item label="访问密码" name={['config', 'password']} rules={[{ required: isEncryptEnabled, message: '请输入访问密码' }]}>
            <Input.Password placeholder="请输入访问密码" />
          </Form.Item>
        )}

        <Form.Item className="!mb-0">
          <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">
            {id && !isDraftParams ? '编辑文章' : '发布文章'}
          </Button>
        </Form.Item>

        {/* 草稿和编辑状态下不再显示保存草稿按钮 */}
        {((isDraftParams && id) || !id) && (
          <Form.Item className="!mt-2 !mb-0">
            <Button className="w-full" onClick={() => form.validateFields().then((values) => onSubmit(values, true))}>
              {isDraftParams ? '保存' : '保存为草稿'}
            </Button>
          </Form.Item>
        )}
      </Form>

      <Material
        // multiple
        open={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSelect={(url) => {
          form.setFieldValue('cover', url[0]);
          form.validateFields(['cover']); // 手动触发 image 字段的校验
        }}
      />
    </div>
  );
};

export default PublishForm;
