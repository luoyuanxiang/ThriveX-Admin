import { useEffect, useState, useRef } from 'react'
import { Image, Card, Space, Spin, message, Popconfirm, Button, Drawer, Divider, Modal, Form, Input, DatePicker } from 'antd'
import Title from '@/components/Title'
import { getAlbumCateListAPI, getImagesByAlbumIdAPI, delAlbumCateDataAPI, addAlbumCateDataAPI, editAlbumCateDataAPI } from '@/api/Album'
import { delAlbumImageDataAPI, addAlbumImageDataAPI } from '@/api/AlbumImage'
import { AlbumCate } from '@/types/app/album'
import { PiKeyReturnFill } from "react-icons/pi";
import { DeleteOutlined, DownloadOutlined, RotateLeftOutlined, RotateRightOutlined, SwapOutlined, UndoOutlined, ZoomInOutlined, ZoomOutOutlined, EditOutlined, PictureOutlined, CloudUploadOutlined } from '@ant-design/icons';
import errorImg from '../File/image/error.png'
import albumSvg from '../File/image/file.svg'
import Material from '@/components/Material'
import Masonry from "react-masonry-css";
import TextArea from 'antd/es/input/TextArea'
import "./index.scss"

// Masonry布局的响应式断点配置
const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

export default () => {
  // 加载状态
  const [loading, setLoading] = useState(false)
  // 按钮加载状态
  const [btnLoading, setBtnLoading] = useState(false)
  // 下载加载状态
  const [downloadLoading, setDownloadLoading] = useState(false)
  // 当前页码
  const [page, setPage] = useState(1)
  // 是否还有更多数据
  const [hasMore, setHasMore] = useState(true)
  // 防止重复加载的引用
  const loadingRef = useRef(false)

  // 弹窗状态
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddAlbumModalOpen, setIsAddAlbumModalOpen] = useState(false);
  const [openImageInfoDrawer, setOpenImageInfoDrawer] = useState(false);
  const [openImagePreviewDrawer, setOpenImagePreviewDrawer] = useState(false);

  // 相册和照片列表数据
  const [albumList, setAlbumList] = useState<AlbumCate[]>([])
  const [imageList, setImageList] = useState<any[]>([])

  // 当前选中的相册和照片
  const [currentAlbum, setCurrentAlbum] = useState<AlbumCate>({} as AlbumCate)
  const [currentImage, setCurrentImage] = useState<any>({})

  // 相册表单
  const [form] = Form.useForm();
  // 相册表单弹窗
  const [openAlbumModal, setOpenAlbumModal] = useState(false);
  // 相册表单类型（新增/修改）
  const [albumModalType, setAlbumModalType] = useState<'add' | 'edit'>('add');
  // 相册表单加载状态
  const [albumFormLoading, setAlbumFormLoading] = useState(false);

  // 上传照片表单
  const [uploadForm] = Form.useForm();
  // 上传照片加载状态
  const [uploadLoading, setUploadLoading] = useState(false);

  /**
   * 获取相册列表
   */
  const getAlbumList = async () => {
    try {
      setLoading(true)
      const { data } = await getAlbumCateListAPI()

      setAlbumList(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  /**
   * 获取指定相册的照片列表
   * @param albumId 相册ID
   * @param isLoadMore 是否为加载更多
   */
  const getImageList = async (albumId: number, isLoadMore = false) => {
    if (loadingRef.current) return
    
    try {
      loadingRef.current = true
      setLoading(true)

      const { data } = await getImagesByAlbumIdAPI(albumId, isLoadMore ? page + 1 : 1)

      if (!isLoadMore) {
        setImageList(data.result)
        setPage(1)
      } else {
        setImageList(prev => [...prev, ...data.result])
        setPage(prev => prev + 1)
      }

      setHasMore(data.result.length === 10)

      if (!imageList.length && !data.result.length && !isLoadMore) {
        message.error("该相册中没有照片")
      }

      setLoading(false)
      loadingRef.current = false
    } catch (error) {
      setLoading(false)
      loadingRef.current = false
    }
  }

  /**
   * 删除照片
   * @param data 要删除的照片数据
   */
  const onDeleteImage = async (data: any) => {
    try {
      setBtnLoading(true)
      await delAlbumImageDataAPI(data.id)
      await getImageList(currentAlbum.id!)
      message.success("🎉 删除照片成功")
      setCurrentImage({})
      setOpenImageInfoDrawer(false)
      setOpenImagePreviewDrawer(false)
      setBtnLoading(false)
    } catch (error) {
      setBtnLoading(false)
    }
  }

  /**
   * 下载照片
   * @param data 要下载的照片数据
   */
  const onDownloadImage = (data: any) => {
    try {
      setDownloadLoading(true)
      fetch(data.image)
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(new Blob([blob]));
          const link = document.createElement<'a'>('a');
          link.href = url;
          link.download = data.name;
          document.body.appendChild(link);
          link.click();
          URL.revokeObjectURL(url);
          link.remove();
        });
      setDownloadLoading(false)
    } catch (error) {
      setDownloadLoading(false)
    }
  };

  /**
   * 处理滚动事件，实现下拉加载更多
   * @param e 滚动事件对象
   */
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !loading && currentAlbum.id) {
      await getImageList(currentAlbum.id, true)
    }
  }

  /**
   * 打开相册
   * @param album 相册数据
   */
  const openAlbum = async (album: AlbumCate) => {
    setCurrentAlbum(album)
    await getImageList(album.id!)
  }

  // 组件挂载时获取相册列表
  useEffect(() => {
    getAlbumList()
  }, [])

  /**
   * 查看照片信息
   * @param image 照片数据
   */
  const viewImageInfo = (image: any) => {
    setOpenImageInfoDrawer(true)
    setCurrentImage(image)
  }

  /**
   * 打开相册表单
   * @param type 表单类型
   * @param album 相册数据（修改时传入）
   */
  const openAlbumForm = (type: 'add' | 'edit', album?: AlbumCate) => {
    setAlbumModalType(type);
    if (type === 'edit' && album) {
      form.setFieldsValue(album);
    } else {
      form.resetFields();
    }
    setOpenAlbumModal(true);
  }

  /**
   * 提交相册表单
   */
  const onAlbumFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setAlbumFormLoading(true);

      if (albumModalType === 'add') {
        await addAlbumCateDataAPI(values);
        message.success("🎉 新增相册成功");
      } else {
        await editAlbumCateDataAPI(values);
        message.success("🎉 修改相册成功");
      }

      setOpenAlbumModal(false);
      await getAlbumList();
      setAlbumFormLoading(false);
    } catch (error) {
      setAlbumFormLoading(false);
    }
  }

  /**
   * 删除相册
   * @param album 要删除的相册数据
   */
  const onDeleteAlbum = async (album: AlbumCate) => {
    try {
      setBtnLoading(true);
      await delAlbumCateDataAPI(album.id!);
      await getAlbumList();
      message.success("🎉 删除相册成功");
      setBtnLoading(false);
    } catch (error) {
      setBtnLoading(false);
    }
  }

  /**
   * 提交上传照片表单
   */
  const onUploadSubmit = async () => {
    try {
      const values = await uploadForm.validateFields();
      setUploadLoading(true);

      await addAlbumImageDataAPI({
        name: values.name,
        description: values.description,
        image: values.image,
        cateId: currentAlbum.id!,
        createTime: values.date.valueOf()
      });

      message.success("🎉 上传照片成功");
      setIsAddAlbumModalOpen(false);
      uploadForm.resetFields();
      await getImageList(currentAlbum.id!);
      setUploadLoading(false);
    } catch (error) {
      setUploadLoading(false);
    }
  }

  return (
    <div>
      <Title value='相册管理' />

      <Card className='AlbumPage mt-2 min-h-[calc(100vh-180px)]'>
        <div className='flex justify-between mb-4 px-4'>
          {
            !imageList.length
              ? <PiKeyReturnFill className='text-4xl text-[#E0DFDF] cursor-pointer' />
              : <PiKeyReturnFill className='text-4xl text-primary cursor-pointer' onClick={() => {
                setImageList([])
                setCurrentAlbum({} as AlbumCate)
              }} />
          }

          <Space>
            {
              currentAlbum.id
                ? <Button type="primary" disabled={!imageList.length} onClick={() => setIsAddAlbumModalOpen(true)}>上传照片</Button>
                : <Button type="primary" onClick={() => openAlbumForm('add')}>新增相册</Button>
            }
          </Space>
        </div>

        {/* 照片列表 */}
        <Spin spinning={loading}>
          <div
            className={`flex flex-wrap ${currentAlbum.id ? '!justify-center' : 'justify-start!'} md:justify-normal overflow-y-auto max-h-[calc(100vh-300px)]`}
            onScroll={handleScroll}
          >
            {
              imageList.length
                ? (
                  <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="masonry-grid"
                    columnClassName="masonry-grid_column"
                  >
                    {
                      imageList.map((item, index) =>
                        <div
                          key={index}
                          className={`group relative overflow-hidden rounded-md cursor-pointer mb-4 border-2 border-[#eee] dark:border-transparent hover:!border-primary p-1 ${currentImage.id === item.id ? 'border-primary' : 'border-gray-100'}`}
                          onClick={() => viewImageInfo(item)}>

                          <Image
                            src={item.image}
                            className='w-full rounded-md'
                            loading="lazy"
                            preview={false}
                            fallback={errorImg}
                          />
                        </div>
                      )
                    }
                  </Masonry>
                )
                : albumList.map((item, index) => (
                  <div
                    key={index}
                    className='group w-25 flex flex-col items-center cursor-pointer m-4 relative'
                    onClick={() => openAlbum(item)}>

                    <div className="relative w-32 h-32">
                      <img src={albumSvg} className="w-full h-full p-2 object-cover" />

                      <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center'>
                        <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                          <Space size="middle">
                            <Button
                              type="primary"
                              shape="circle"
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                openAlbumForm('edit', item);
                              }}
                            />

                            <Popconfirm
                              title="删除相册"
                              description="删除后无法恢复，确定要删除吗？"
                              onConfirm={(e) => {
                                e?.stopPropagation();
                                onDeleteAlbum(item);
                              }}
                              okText="删除"
                              cancelText="取消"
                              placement="bottom"
                            >
                              <Button
                                type="primary"
                                danger
                                shape="circle"
                                icon={<DeleteOutlined />}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Popconfirm>
                          </Space>
                        </div>
                      </div>
                    </div>

                    <p className='group-hover:text-primary transition-colors text-sm mt-1'>{item.name}</p>
                    <p className='text-slate-400 text-xs mt-1'>{item.images?.length || 0} 张照片</p>
                  </div>
                ))
            }
          </div>
        </Spin>
      </Card>

      {/* 相册表单弹窗 */}
      <Modal
        title={albumModalType === 'add' ? '新增相册' : '修改相册'}
        open={openAlbumModal}
        onOk={onAlbumFormSubmit}
        onCancel={() => setOpenAlbumModal(false)}
        confirmLoading={albumFormLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="相册名称"
            rules={[{ required: true, message: '请输入相册名称' }]}
          >
            <Input placeholder="请输入相册名称" />
          </Form.Item>

          <div>
            <Form.Item name="cover" label="相册封面"
              rules={[
                {
                  pattern: /^https?:\/\//,
                  message: '请输入正确的链接',
                  warningOnly: false
                }
              ]}
            >
              <Input placeholder="请输入相册封面链接" />
            </Form.Item>

            <div className='flex justify-center'>
              <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.cover !== currentValues.cover}>
                {() => (
                  <img src={form.getFieldValue('cover')} alt="" className='h-35 rounded-md object-cover object-center' />
                )}
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      {/* 照片信息抽屉 */}
      <Drawer
        width={600}
        title="照片信息"
        placement="right"
        open={openImageInfoDrawer}
        onClose={() => { setOpenImageInfoDrawer(false); setCurrentImage({}) }}
      >
        <div className='flex flex-col'>
          <div className='flex'>
            <span className='min-w-20 font-bold'>照片名称</span>
            <span className='text-[#333] dark:text-white'>{currentImage.name}</span>
          </div>

          <div className='flex'>
            <span className='min-w-20 font-bold'>所属相册</span>
            <span className='text-[#333] dark:text-white'>{currentAlbum.name}</span>
          </div>

          <div className='flex'>
            <span className='min-w-20  font-bold'>照片链接</span>
            <span className='text-[#333] dark:text-white hover:text-primary cursor-pointer transition' onClick={async () => {
              await navigator.clipboard.writeText(currentImage.image)
              message.success("🎉 复制成功")
            }}>{currentImage.image}</span>
          </div>
        </div>

        <Divider orientation="center">照片预览</Divider>
        <Image
          src={currentImage.image}
          className='rounded-md object-cover object-center'
          fallback={errorImg}
          preview={{
            onVisibleChange: (visible) => setOpenImagePreviewDrawer(visible),
            visible: openImagePreviewDrawer,
            toolbarRender: (
              _,
              {
                transform: { scale },
                actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn, onReset },
              },
            ) => (
              <Space className="toolbar-wrapper flex-col">
                <div className='customAntdPreviewsItem'>
                  <Popconfirm
                    title="警告"
                    description="删除后无法恢复，确定要删除吗"
                    onConfirm={() => onDeleteImage(currentImage)}
                    okText="删除"
                    cancelText="取消"
                  >
                    <DeleteOutlined />
                  </Popconfirm>

                  <DownloadOutlined onClick={() => onDownloadImage(currentImage)} />
                  <SwapOutlined rotate={90} onClick={onFlipY} />
                  <SwapOutlined onClick={onFlipX} />
                  <RotateLeftOutlined onClick={onRotateLeft} />
                  <RotateRightOutlined onClick={onRotateRight} />
                  <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                  <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                  <UndoOutlined onClick={onReset} />
                </div>
              </Space>
            ),
          }} />

        <Divider orientation="center">照片操作</Divider>
        <Button type='primary' loading={downloadLoading} onClick={() => onDownloadImage(currentImage)} className='w-full mb-2'>下载照片</Button>
        <Popconfirm
          title="警告"
          description="删除后无法恢复，确定要删除吗"
          onConfirm={() => onDeleteImage(currentImage)}
          okText="删除"
          cancelText="取消"
        >
          <Button type='primary' danger loading={btnLoading} className='w-full'>删除照片</Button>
        </Popconfirm>
      </Drawer>

      {/* 上传照片弹窗 */}
      <Modal
        title="上传照片"
        open={isAddAlbumModalOpen}
        onOk={onUploadSubmit}
        onCancel={() => {
          setIsAddAlbumModalOpen(false);
          uploadForm.resetFields();
        }}
        confirmLoading={uploadLoading}
      >
        <Form form={uploadForm} layout="vertical" size='large'>
          <Form.Item
            name="name"
            label="照片名称"
            rules={[{ required: true, message: '请输入照片名称' }]}
          >
            <Input placeholder="请输入照片名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="照片描述"
          >
            <TextArea rows={2} placeholder="请输入照片描述" />
          </Form.Item>

          <div>
            <Form.Item
              name="image"
              label="照片链接"
              rules={[
                { required: true, message: '请输入照片链接' },
                {
                  pattern: /^https?:\/\//,
                  message: '请输入正确的链接',
                  warningOnly: false
                }
              ]}
            >
              <Input placeholder="请输入照片链接" prefix={<PictureOutlined />} addonAfter={<CloudUploadOutlined className='text-xl cursor-pointer' onClick={() => setIsUploadModalOpen(true)} />} className='customizeAntdInputAddonAfter' />
            </Form.Item>
          </div>

          <Form.Item
            name="date"
            label="照片日期"
            rules={[{ required: true, message: '请选择照片日期' }]}
          >
            <DatePicker className='w-full' placeholder="请选择照片日期" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Material组件 */}
      <Material
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSelect={(url) => {
          if (url.length) {
            uploadForm.setFieldValue("image", url[0]);
            uploadForm.validateFields(['image']);
          }
        }}
      />
    </div>
  )
}