import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Modal, Input, Select, Space, message } from 'antd';
import { BytemdEditorContext, BytemdPlugin } from 'bytemd';


import videoSvg from './../icon/video.svg?raw'
import { VideoPlatform, VIDEO_PLATFORMS } from './videoPlatforms.ts';

type VideoType = typeof VIDEO_PLATFORMS[number]['label']

/* ---------- 子组件：弹窗 ---------- */
interface VideoModalProps {
  onOk: (type: VideoType, id: string) => void;
  onCancel: () => void;
}
const VideoModal: React.FC<VideoModalProps> = ({ onOk, onCancel }) => {
  const [type, setType] = useState<VideoType>('抖音');
  const [id, setId] = useState('');
  const [placeholder, setPlaceholder] = useState(VIDEO_PLATFORMS[0].example);

  const handleOk = () => {
    const vid = id.trim();
    if (!vid) return message.warning('请输入视频 ID/完整的RUL');
    onOk(type, vid);
  };

  return (
    <Modal
      title="插入视频"
      open
      onOk={handleOk}
      onCancel={onCancel}
      okText="插入"
      cancelText="取消"
      width={400}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select value={type} onChange={value => {
          setType(value);
          setPlaceholder(VIDEO_PLATFORMS.find((platform: VideoPlatform) => platform.value === value)?.example || '');
        }} style={{ width: '100%' }}>
          {VIDEO_PLATFORMS.map((platform: VideoPlatform) => (
            <Select.Option key={platform.value} value={platform.value}>{platform.label}</Select.Option>
          ))}
        </Select>
        <Input
          placeholder={placeholder}
          value={id}
          onChange={(e) => setId(e.target.value)}
          onPressEnter={handleOk}
        />
      </Space>
    </Modal>
  );
};

/* ---------- 工具函数：生成 iframe ---------- */
const buildIframeMd = (type: VideoType, id: string): string => {
  const v: VideoPlatform | undefined = VIDEO_PLATFORMS.find((platform: VideoPlatform) => platform.label === type);
  if (v?.pattern) {
    const url = v.pattern.replace('{{id}}', id);
    return `<iframe src="${url}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
  }
  return `<iframe src="${id}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
};

/* ---------- 插件工厂 ---------- */
export default function videoModalPlugin(): BytemdPlugin {
  let ctxRef: BytemdEditorContext | null = null;

  const openModal = () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);

    const close = () => {
      root.unmount();
      div.remove();
    };

    const handleOk = (type: VideoType, id: string) => {
      if (!ctxRef) return;
      ctxRef.appendBlock(buildIframeMd(type, id));
      ctxRef.editor.focus();
      close();
    };

    root.render(<VideoModal onOk={handleOk} onCancel={close} />);
  };

  return {
    actions: [
      {
        title: '插入视频',
        icon: videoSvg,
        handler: {
          type: 'action',
          click(ctx: BytemdEditorContext ) {
            ctxRef = ctx;
            openModal();
          },
        },
      },
    ],
  };
}