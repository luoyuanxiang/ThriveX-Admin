import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from './common/Loader';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import { ConfigProvider, theme } from 'antd';
import RouteList from './components/RouteList';
import '@/styles/customAntd.scss';

import { getWebConfigDataAPI } from '@/api/Config';
import { useWebStore, useUserStore } from './stores';
import { Web } from './types/app/config';

import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';

function App() {
  useAuthRedirect();

  const token = useUserStore((state) => state.token);

  const [loading, setLoading] = useState<boolean>(true);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const setWeb = useWebStore((state) => state.setWeb);
  const getWebData = async () => {
    if (!token) return;
    const { data } = await getWebConfigDataAPI<{ value: Web }>('web');
    setWeb(data.value);
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);

    const bodyClassList = document.body.classList;

    // 监听类名变化
    const observer = new MutationObserver(() => {
      setIsDarkTheme(bodyClassList.contains('dark'));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    getWebData();
  }, [token]);

  return loading ? (
    <Loader />
  ) : (
    // 根据主题切换配置主题
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#60a5fa',
          colorBgBase: isDarkTheme ? '#24303F' : '#ffffff',
          colorTextBase: isDarkTheme ? '#e0e0e0' : '#000000',
        },
        algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <RouteList />
    </ConfigProvider>
  );
}

export default App;
