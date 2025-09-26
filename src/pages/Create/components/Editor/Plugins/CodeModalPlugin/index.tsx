import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Input, Modal, Select, Space } from 'antd';
import type { BytemdEditorContext, BytemdPlugin } from 'bytemd';
import { Language, CODE_LANGUAGES } from './languages.ts';


const { TextArea } = Input;
const { Option } = Select;

export interface CodeModalPluginOptions {
  title?: string;
  okText?: string;
  cancelText?: string;
  placeholder?: string;
  languagePlaceholder?: string;
  /** 预设语言列表 */
  languages?: Language[];
}

export default function CodeModalPlugin(opts: CodeModalPluginOptions = {}): BytemdPlugin {
  const { title = '插入代码', okText = '确定', cancelText = '取消', placeholder = '请粘贴或输入代码', languagePlaceholder = '选择语言', languages = CODE_LANGUAGES } = opts;

  return {
    actions: [
      {
        title,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
        handler: {
          type: 'action',
          click(ctx: BytemdEditorContext) {
            const holder = document.createElement('div');
            document.body.appendChild(holder);

            const root = createRoot(holder);

            const CodeModal = () => {
              const [open, setOpen] = useState<boolean>(true);
              const [lang, setLang] = useState<string>('');
              const [code, setCode] = useState<string>('');

              const handleOk = () => {
                const fence = `\`\`\`${lang}\n${code}\n\`\`\`\n`;
                ctx.appendBlock(fence);
                setOpen(false);
              };

              const handleCancel = () => setOpen(false);

              const afterClose = () => {
                // 延迟到下一个事件循环周期执行卸载操作
                setTimeout(() => {
                  if (holder.parentNode) {
                    root.unmount();
                    document.body.removeChild(holder);
                  }
                }, 0);
              };

              return (
                <Modal title={title} open={open} onOk={handleOk} onCancel={handleCancel} afterClose={afterClose} okText={okText} cancelText={cancelText} width={640}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Select style={{ width: '100%' }} placeholder={languagePlaceholder} value={lang} onChange={setLang} allowClear>
                      {languages.map((l) => (
                        <Option key={l.value} value={l.value}>
                          {l.label}
                        </Option>
                      ))}
                    </Select>
                    <TextArea rows={12} placeholder={placeholder} value={code} onChange={(e) => setCode(e.target.value)} />
                  </Space>
                </Modal>
              );
            };

            root.render(<CodeModal />);
          },
        },
      },
    ],
  };
}
