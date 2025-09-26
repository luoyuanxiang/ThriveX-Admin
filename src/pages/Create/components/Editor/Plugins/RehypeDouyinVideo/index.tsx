import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';
import type { BytemdPlugin } from 'bytemd';
import { Input, message, Modal } from 'antd';
import videoSvg from '@/pages/Create/components/Editor/Plugins/icon/video.svg?raw';

const rehypeDouyinVideo: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'p') {
        const link = node.children[0];
        if (link.type === 'element' && link.tagName === 'a' && link.properties?.href && typeof link.properties.href === 'string') {
          const match = /(?:ixigua\.com|douyin\.com)\/(\d+)/.exec(link.properties.href);
          if (match) {
            const videoId = match[1];
            const wrapperDiv = {
              type: 'element',
              tagName: 'div',
              properties: {
                className: 'flex justify-center',
              },
              children: [
                {
                  type: 'element',
                  tagName: 'iframe',
                  properties: {
                    src: `https://open.douyin.com/player/video?vid=${videoId}&autoplay=0`,
                    referrerPolicy: 'unsafe-url',
                    allowFullScreen: true,
                    className: 'douyin',
                  },
                  children: [],
                },
              ],
            };

            Object.assign(node, wrapperDiv);
          }
        }
      }
    });
  };
};

const DouyinVideo = (): BytemdPlugin => {
  return {
    rehype: (processor) => processor.use(rehypeDouyinVideo),
    actions: [
      {
        title: '视频',
        icon: videoSvg,
        handler: {
          type: 'action',
          click: (ctx) => {
            let videoId = '';

            Modal.info({
              title: '插入抖音视频',
              content: (
                <div>
                  <div className="mb-2 text-xs">目前仅支持插入抖音视频</div>
                  <Input placeholder="请输入抖音视频ID" onChange={(e) => (videoId = e.target.value.trim())} />
                </div>
              ),
              cancelText: '取消',
              okText: '确认',
              onOk: () => {
                if (!videoId) {
                  message.error('请输入抖音视频ID');
                  return Promise.reject();
                }

                ctx.appendBlock(`[douyin-video](${videoId})`);
              },
              maskClosable: true,
              keyboard: true,
            });
          },
        },
      },
    ],
  };
};

export default DouyinVideo;