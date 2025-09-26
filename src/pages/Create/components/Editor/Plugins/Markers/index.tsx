import type { BytemdPlugin, BytemdEditorContext } from 'bytemd';
import { remarkMark } from 'remark-mark-highlight';

import markerSvg from '@/pages/Create/components/Editor/Plugins/icon/marker.svg?raw';

const Markers = (): BytemdPlugin => {
  return {
    remark: (processor) => processor.use(remarkMark),
    actions: [
      {
        title: '标记',
        icon: markerSvg,
        handler: {
          type: 'action',
          click: (ctx: BytemdEditorContext) => {
            ctx.wrapText('==', '==');
          },
        },
      },
    ],
  };
};

export default Markers;