import { useRef, useState, useCallback } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Modal, Radio, Select, Spin } from 'antd';
import { useUserStore } from '@/stores';
import { DirList } from '@/types/app/file';
import { baseURL } from '@/utils/request';
import Compressor from 'compressorjs';

interface Props {
  multiple?: boolean;
  dir: DirList;
  open: boolean;
  onSuccess: (urls: string[]) => void;
  onCancel: () => void;
}

export default ({ multiple, dir, open, onCancel, onSuccess }: Props) => {
  const store = useUserStore();
  const dragCounterRef = useRef(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quality, setQuality] = useState(1000);
  const [isCompressionUpload, setIsCompressionUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onUploadFile = async (files: File[]) => {
    try {
      setIsLoading(true);

      // 上传前先压缩文件大小
      const compressedFiles = await Promise.all(
        files.map((file) => {
          return new Promise<File>((resolve, reject) => {
            new Compressor(file, {
              quality,
              success: (blob) => {
                // 将 Blob 转换为 File
                const f = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(f);
              },
              error: (err) => reject(err),
            });
          });
        }),
      );

      // 处理成后端需要的格式
      const formData = new FormData();
      formData.append('dir', dir);
      for (let i = 0; i < compressedFiles.length; i++) {
        formData.append('files', compressedFiles[i]);
      }

      // 发起网络请求
      const res = await fetch(`${baseURL}/file`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });

      const { code, message: msg, data } = await res.json();
      if (code !== 200) return message.error('文件上传失败：' + msg);

      try {
        // 把数据写入到剪贴板
        await navigator.clipboard.writeText(data.join('\n'));
      } catch (error) {
        console.error(error);
        message.error('复制到剪贴板失败，请手动复制');
        onSuccess(data);
        setIsLoading(false);
        return;
      }

      message.success(`🎉 文件上传成功，URL链接已复制到剪贴板`);
      onSuccess(data);
      onCloseModel();
    } catch (error) {
      message.error('文件上传失败：' + (error as Error).message);
      onCloseModel();
    }
  };

  const onCloseModel = () => {
    setIsCompressionUpload(false);
    setQuality(1000);
    setIsLoading(false);
    onCancel();
  };

  // 文件上传
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUploadFile([...e.target.files]);
    }
  };

  // 拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 拖拽进入
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  }, []);

  // 拖拽离开
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  // 拖拽放下
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onUploadFile(files);
      }
    },
    [onUploadFile],
  );

  return (
    <>
      <Modal title="文件上传" open={open} onCancel={onCloseModel} footer={null}>
        <Spin spinning={isLoading}>
          <div className="my-4">
            <Radio.Group
              defaultValue={0}
              value={isCompressionUpload ? 1 : 0}
              onChange={(e) => setIsCompressionUpload(e.target.value ? true : false)}
            >
              <Radio value={0}>无损上传</Radio>
              <Radio value={1}>压缩上传</Radio>
            </Radio.Group>

            {isCompressionUpload && (
              <Select
                onChange={setQuality}
                options={[
                  { value: 1, label: '轻量压缩(推荐)' },
                  { value: 'NaN', label: '自适应压缩' },
                  { value: 0.9, label: '0.9' },
                  { value: 0.8, label: '0.8' },
                  { value: 0.7, label: '0.7' },
                  { value: 0.6, label: '0.6' },
                  { value: 0.5, label: '0.5' },
                  { value: 0.4, label: '0.4' },
                  { value: 0.3, label: '0.3' },
                  { value: 0.2, label: '0.2' },
                  { value: 0.1, label: '0.1' },
                ]}
                defaultValue={1}
                placeholder="请选择图片压缩质量"
                className="min-w-44"
              />
            )}
          </div>

          <div
            onClick={() => fileInputRef?.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full h-40 p-4 border border-dashed rounded-lg transition-all duration-300 ${
              isDragging ? 'border-primary bg-primary/5' : 'border-[#D7D7D7] hover:border-primary bg-[#FAFAFA]'
            } space-y-2 cursor-pointer`}
          >
            <div className="flex justify-center">
              <InboxOutlined className="text-5xl text-primary" />
            </div>

            <p className="text-base text-center">{isDragging ? '释放文件以上传' : '点击或拖动文件到此区域进行上传'}</p>
            <p className="text-sm text-[#999] text-center">支持单个或多个上传</p>
          </div>

          <input multiple={multiple} type="file" onChange={handleFileInput} ref={fileInputRef} className="hidden" />
        </Spin>
      </Modal>
    </>
  );
};
