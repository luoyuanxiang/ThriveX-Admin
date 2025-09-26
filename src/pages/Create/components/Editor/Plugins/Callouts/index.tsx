import type { BytemdPlugin } from 'bytemd';
import rehypeCallouts from 'rehype-callouts';

import calloutSvg from '@/pages/Create/components/Editor/Plugins/icon/callout.svg?raw';
import noteSvg from '@/pages/Create/components/Editor/Plugins/icon/note.svg?raw';
import tipSvg from '@/pages/Create/components/Editor/Plugins/icon/tip.svg?raw';
import warningSvg from '@/pages/Create/components/Editor/Plugins/icon/warning.svg?raw';
import checkSvg from '@/pages/Create/components/Editor/Plugins/icon/check.svg?raw';
import dangerSvg from '@/pages/Create/components/Editor/Plugins/icon/danger.svg?raw';

const Callouts = (): BytemdPlugin => {
  const calloutTypes = [
    { title: 'Note', icon: noteSvg, blockType: '[!NOTE]' },
    { title: 'Tip', icon: tipSvg, blockType: '[!TIP]' },
    { title: 'Warning', icon: warningSvg, blockType: '[!WARNING]' },
    { title: 'Check', icon: checkSvg, blockType: '[!CHECK]' },
    { title: 'Danger', icon: dangerSvg, blockType: '[!DANGER]' },
  ];

  return {
    rehype: (processor) => processor.use(rehypeCallouts),
    actions: [
      {
        icon: calloutSvg,
        handler: {
          type: 'dropdown',
          actions: calloutTypes.map(({ title, icon, blockType }) => ({
            title,
            icon,
            handler: {
              type: 'action',
              click: (ctx) => {
                ctx.appendBlock(`> ${blockType} ${title}\n> `);
              },
            },
          })),
        },
      },
    ],
  };
};

export default Callouts;