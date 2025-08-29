import { useState } from 'react';

import { Card } from 'antd';
import { AiOutlineSetting } from 'react-icons/ai';
import { BiGlobe, BiLayout, BiShieldQuarter, BiUser } from 'react-icons/bi';

import Title from '@/components/Title';
import My from './components/My';
import System from './components/System';
import Theme from './components/Theme';
import Web from './components/Web';
import Other from './components/Other';

interface Setup {
  title: string;
  description: string;
  icon: React.ReactNode;
  key: string;
}

export default () => {
  const [active, setActive] = useState('system');

  const iconSty = 'w-5 h-8 mr-1';

  const list: Setup[] = [
    {
      title: '账户配置',
      description: '配置管理员账号、密码等',
      icon: <BiShieldQuarter className={iconSty} />,
      key: 'system',
    },
    {
      title: '网站配置',
      description: '配置网站标题、LOGO、描述、SEO等',
      icon: <BiGlobe className={iconSty} />,
      key: 'web',
    },
    {
      title: '主题配置',
      description: '配置网站主题风格',
      icon: <BiLayout className={iconSty} />,
      key: 'theme',
    },
    {
      title: '个人配置',
      description: '配置个人信息等',
      icon: <BiUser className={iconSty} />,
      key: 'my',
    },
    {
        title: '其他设置',
        description: '杂七八乱的各种配置',
        icon: <AiOutlineSetting className={iconSty} />,
        key: 'other'
    }
  ];

  return (
    <div>
      <Title value="系统配置" />

      <Card className="mt-2 min-h-[calc(100vh-160px)]">
        <div className="flex flex-col md:flex-row">
          <ul className="w-full md:w-[20%] md:mr-5 mb-10 md:mb-0 border-b-0 md:border-r border-stroke dark:border-strokedark divide-y divide-solid divide-[#F6F6F6] dark:divide-strokedark">
            {list.map((item) => (
              <li key={item.key} className={`relative p-3 pl-5 before:content-[''] before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:w-[3.5px] before:h-[0%] before:bg-[#60a5fa] cursor-pointer transition-all ${active === item.key ? 'bg-[#f7f7f8] dark:bg-[#3c5370] before:h-full' : ''}`} onClick={() => setActive(item.key)}>
                <h3 className="flex items-center text-base">
                  {item.icon} {item.title}
                </h3>

                <p className="text-[13px] text-[#858585] text-gray-500 mt-1">{item.description}</p>
              </li>
            ))}
          </ul>

          <div className="w-full md:w-[80%] px-0 md:px-8">
            {active === 'system' && <System />}
            {active === 'web' && <Web />}
            {active === 'theme' && <Theme />}
            {active === 'my' && <My />}
            {active === 'other' && <Other />}
          </div>
        </div>
      </Card>
    </div>
  );
};
