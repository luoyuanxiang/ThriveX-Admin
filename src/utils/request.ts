import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Modal, notification } from 'antd';
import { useUserStore } from '@/stores';

// 配置项目API域名
// 最新调整：在本地 .env 文件配置你的后端API地址
export const baseURL = import.meta.env.VITE_PROJECT_API;

// 创建 axios 实例
export const instance = axios.create({
  // 项目API根路径
  baseURL,
  // 请求超时的时间
  timeout: 100000000,
});

// 用于取消请求
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

// 标记是否已经处理过401错误
let isHandling401Error = false;

// 请求拦截
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 获取token
    const token = JSON.parse(localStorage.getItem('user_storage') || '{}')?.state.token;

    // 如果有token就把赋值给请求头
    if (token) config.headers['Authorization'] = `Bearer ${token}`;

    return config;
  },
  (err: AxiosError) => {
    notification.error({
      message: '请求异常',
      description: err.message,
    });

    return Promise.reject(err);
  },
);

/**
 * 处理 Blob 字节流，触发浏览器下载
 * @param {AxiosResponse} response - Axios 响应对象（response.data 为 Blob）
 */
const handleBlobDownload = (response: AxiosResponse) => {
  // 1. 获取 Blob 数据和文件名
  const blob = response.data;
  const fileName = getFileNameFromResponse(response);

  // 2. 创建临时 URL（指向 Blob 数据）
  const blobUrl = URL.createObjectURL(blob);

  // 3. 动态创建 <a> 标签，模拟点击下载
  const aElement = document.createElement('a');
  aElement.href = blobUrl; // 绑定临时 URL
  aElement.download = fileName; // 设置下载文件名（浏览器会忽略 URL 中的文件名）
  aElement.style.display = 'none'; // 隐藏标签

  // 4. 插入文档并触发点击
  document.body.appendChild(aElement);
  aElement.click();

  // 5. 清理资源（避免内存泄漏）
  document.body.removeChild(aElement);
  URL.revokeObjectURL(blobUrl); // 释放临时 URL
};

/**
 * 从响应头 Content-Disposition 中提取文件名
 * @param {AxiosResponse} response - Axios 响应对象
 * @returns {string} 文件名（默认：export.md）
 */
const getFileNameFromResponse = (response: AxiosResponse): string => {
  // 1. 获取 Content-Disposition 响应头
  const disposition = response.headers['content-disposition'];
  if (!disposition) return 'export.md'; // 默认文件名

  // 2. 匹配文件名（处理两种格式：filename=xxx 或 filename*=UTF-8''xxx）
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/); // 匹配 filename="xxx.md"
  const filenameStarMatch = disposition.match(/filename\*=UTF-8''([^;]+)/); // 匹配 filename*=UTF-8''xxx.md（处理中文）

  // 3. 优先处理 filename*（支持中文），其次处理 filename
  if (filenameStarMatch && filenameStarMatch[1]) {
    // 解码 UTF-8 编码的文件名（解决中文乱码）
    return decodeURIComponent(filenameStarMatch[1]);
  } else if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1];
  }

  return 'export.md';
};

// 响应拦截
instance.interceptors.response.use(
  (res: AxiosResponse) => {
    if (res.headers['content-disposition']?.includes('attachment')) {
      console.log('是下载流，开始处理下载');
      // 调用之前的 handleBlobDownload 函数触发下载
      handleBlobDownload(res);
      return res.data;
    }
    if (res.data?.code === 600) return res.data;

    // 只要code不等于200, 就相当于响应失败
    if (res.data?.code !== 200) {
      if (res.data?.code === 424) {
        isHandling401Error = true; // 标记为正在处理401错误

        Modal.error({
          title: '暂无权限',
          content: '🔒️ 登录已过期，请重新登录?',
          okText: '去登录',
          onOk: () => {
            const store = useUserStore.getState();
            store.quitLogin();
            isHandling401Error = false; // 重置标记
          },
        });

        // 取消后续的所有请求
        source.cancel('认证失败，取消所有请求');

        return Promise.reject(res?.data);
      }
      if (res.data?.code === 403) {
        notification.error({
          message: '无访问权限',
          description: '无访问权限！',
        });
        return Promise.reject(res.data);
      }
      notification.error({
        message: '响应异常',
        description: res.data?.message || '未知错误',
      });

      return Promise.reject(res.data);
    }

    return res.data;
  },
  (err: AxiosError) => {
    console.log(err);
    if (isHandling401Error) return;

    // 如果code为401就证明认证失败
    if (err.response?.status === 424) {
      isHandling401Error = true; // 标记为正在处理401错误

      Modal.error({
        title: '暂无权限',
        content: '🔒️ 登录已过期，请重新登录?',
        okText: '去登录',
        onOk: () => {
          const store = useUserStore.getState();
          store.quitLogin();
          isHandling401Error = false; // 重置标记
        },
      });

      // 取消后续的所有请求
      source.cancel('认证失败，取消所有请求');

      return Promise.reject(err.response?.data);
    } else if (err.response?.status === 403) {
      notification.error({
        message: '无访问权限',
        description: err.message || '未知错误',
      });
      return Promise.reject(err.response?.data);
    }

    notification.error({
      message: '程序异常',
      description: err.message || '未知错误',
    });

    return Promise.reject(err);
  },
);

const request = <T>(method: string, url: string, reqParams?: object) => {
  return instance.request<Response<T>, Response<T>>({
    method,
    url,
    ...reqParams,
    cancelToken: source.token,
  });
};

export default request;
