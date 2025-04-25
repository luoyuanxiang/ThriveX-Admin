import { useRef, useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Modal, Spin } from 'antd';
import { useUserStore } from '@/stores';
import { baseURL } from '@/utils/request';

interface UploadFileProps {
    open: boolean,
    onSuccess: (urls: string[]) => void,
    onCancel: () => void
}

export default ({ open, onCancel, onSuccess }: UploadFileProps) => {
    const store = useUserStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let files = [...e.target.files!];

        try {
            setIsLoading(true);
            // 处理成后端需要的格式
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
            // 发起网络请求
            const res = await fetch(`${baseURL}/article/import`, {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${store.token}`
                }
            });

            const { code, message: msg, data } = await res.json();
            if (code !== 200) return message.error("文件上传失败：" + msg);

            message.success(`🎉 文件上传成功`);
            onSuccess(data);
            setIsLoading(false);
            onCloseModel();
        } catch (error) {
            message.error("文件上传失败：" + (error as Error).message);
            setIsLoading(false);
        }
    };

    const onCloseModel = () => {
        setIsLoading(false);
        onCancel();
    };

    return (
        <>
            <Modal title="文件上传" open={open} onCancel={onCloseModel} footer={null}>
                <Spin spinning={isLoading}>

                    <div className='mt-4'>
                        <div
                            onClick={() => fileInputRef?.current?.click()}
                            className='w-full h-40 p-4 border border-dashed border-[#D7D7D7] rounded-lg hover:border-primary bg-[#FAFAFA] space-y-2 cursor-pointer transition'
                        >
                            <div className='flex justify-center'>
                                <InboxOutlined className='text-5xl text-primary' />
                            </div>

                            <p className="text-base text-center">点击或拖动文件到此区域进行上传</p>
                            <p className="text-sm text-[#999] text-center">支持单个或多个上传</p>
                        </div>

                        <input
                            multiple
                            type="file"
                            onChange={onUploadFile}
                            ref={fileInputRef}
                            className='hidden'
                        />
                    </div>
                </Spin>
            </Modal>
        </>
    );
};
