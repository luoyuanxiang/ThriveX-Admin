import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { Modal, notification } from "antd";
import { useUserStore } from "@/stores";

// 配置项目API域名
// 最新调整：在本地 .env 文件配置你的后端API地址
export const baseURL = import.meta.env.VITE_PROJECT_API;

// 创建 axios 实例
export const instance = axios.create({
    // 项目API根路径
    baseURL,
    // 请求超时的时间
    timeout: 1000000,
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
        const token = JSON.parse(localStorage.getItem("user_storage") || "{}")?.state.token

        // 如果有token就把赋值给请求头
        if (token) config.headers["Authorization"] = `Bearer ${token}`;

        return config;
    },
    (err: AxiosError) => {
        notification.error({
            message: '请求异常',
            description: err.message,
        })

        return Promise.reject(err);
    }
);

// 响应拦截
instance.interceptors.response.use(
    (res: AxiosResponse) => {
      const contentDisposition = res.headers['content-disposition']
      const contentType = res.headers['content-type']
      if (contentDisposition && contentDisposition.includes('attachment') && res.data instanceof Blob) {
        // 提取文件名
        const fileName = extractFileName(contentDisposition)
        // 触发文件下载
        const blob = new Blob([res.data], { type: contentType })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        // 返回处理后的响应，避免后续处理错误
        return {
          ...res,
          data: { success: true, message: '🎉 导出成功' },
        }
      }
        return res.data;
    },
    (err: AxiosError) => {
        if(isHandling401Error) return;

        // 如果code为401就证明认证失败
        if (err.response?.status === 401) {
            isHandling401Error = true; // 标记为正在处理401错误

            Modal.error({
                title: '暂无权限',
                content: '🔒️ 登录已过期，请重新登录?',
                okText: "去登录",
                onOk: () => {
                    const store = useUserStore.getState()
                    store.quitLogin()
                    isHandling401Error = false; // 重置标记
                }
            });

            // 取消后续的所有请求
            source.cancel('认证失败，取消所有请求');

            return Promise.reject(err.response?.data);
        }

        notification.error({
            message: '程序异常',
            description: err.message || "未知错误",
        })

        return Promise.reject(err);
    }
);

const Request = <T>(method: string, url: string, reqParams?: object) => {
    return instance.request<any, Response<T>>({
        method,
        url,
        ...reqParams,
        cancelToken: source.token
    });
};

// 提取文件名函数
function extractFileName(contentDisposition: string) {
  let fileName = ''
  // 处理filename*编码的情况（如UTF-8）
  const filenameRegex = /filename\*?=([^;]+)/gi
  let matches = filenameRegex.exec(contentDisposition)
  if (matches && matches[1]) {
    fileName = matches[1]
    // 去除可能的前后引号
    fileName = fileName.replace(/^['"]|['"]$/g, '')
    // 处理UTF-8编码的文件名（例如：filename*=UTF-8''example.txt）
    if (fileName.startsWith("UTF-8''")) {
      fileName = decodeURIComponent(fileName.split("UTF-8''")[1])
    }
  } else {
    // 回退到普通filename处理
    const fallbackRegex = /filename=([^;]+)/gi
    matches = fallbackRegex.exec(contentDisposition)
    if (matches && matches[1]) {
      fileName = matches[1].replace(/^['"]|['"]$/g, '')
    }
  }
  // 移除路径（确保只保留文件名）
  fileName = fileName.replace(/^.*[\\/]/, '')
  return fileName
}

export default Request;