import type { BytemdPlugin } from 'bytemd';

import imageSvg from '@/pages/Create/components/Editor/Plugins/icon/image.svg?raw';

const Material = (): BytemdPlugin => {
  return {
    actions: [
      {
        title: '素材库',
        icon: imageSvg,
        handler: {
          type: 'action',
          click: (ctx) => {
            // 触发图片选择弹窗
            const event = new CustomEvent('openMaterialModal', {
              detail: { ctx },
            });
            window.dispatchEvent(event);
          },
        },
      },
    ],
  };
};

export default Material;