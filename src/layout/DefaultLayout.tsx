import React, { ReactNode, useEffect, useState } from 'react';
import { notification } from 'antd';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';
import useVersionData from '@/hooks/useVersionData';
import { useConfigStore } from '@/stores';

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const version = useVersionData();
  const colorMode = useConfigStore((state) => state.colorMode);

  useEffect(() => {
    if (version.tag_name && version.tag_name !== import.meta.env.VITE_VERSION) {
      notification.success({
        message: '系统升级',
        description: `请更新到 ${version.tag_name} 版本，以获得最佳体验`,
      });
    }
  }, [version]);

  useEffect(() => {
    const className = 'dark';
    const bodyClass = window.document.body.classList;

    if (colorMode === 'dark') {
      bodyClass.add(className);
    } else {
      bodyClass.remove(className);
    }
  }, [colorMode]);

  return (
    <div className="dark:bg-[#1A222C] dark:text-[#AEB7C0]">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main>
            <div className="mx-auto p-4">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
