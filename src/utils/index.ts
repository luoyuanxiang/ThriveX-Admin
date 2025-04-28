// 对象转url参数
export const ObjectToUrlParam = (obj: Object): string => {
  return (
    obj &&
    new URLSearchParams(
      Object.keys(obj).reduce(
        (acc, key) => {
          acc[key] = String(obj[key as keyof Object]);
          return acc;
        },
        {} as Record<string, string>,
      ),
    ).toString()
  );
};

/**
 * 下载文件
 *
 * @param url 地址
 * @param fileName 文件名称
 */
export const downloadFile = async (url: string, fileName: string) => {
  try {
    // 发起 Fetch 请求
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP 错误！状态码：${response.status}`);
    }

    // 获取 Content-Type 并提取 MIME 类型
    const contentType =
      response.headers.get('Content-Type') || 'application/octet-stream';
    const mimeType = contentType.split(';')[0].trim();

    // 将响应转换为 Blob
    const blob = await response.blob();

    // 根据 MIME 类型获取文件扩展名
    const extension = getFileExtension(mimeType);

    // 生成文件名
    const filename = fileName ? fileName : generateFilename(url, extension);

    // 创建临时下载链接
    const blobUrl = URL.createObjectURL(blob);

    // 创建并模拟点击下载链接
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放内存
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('下载失败：', error);
  }
};

/**
 * MIME 类型到扩展名的映射
 * @param mimeType
 */
function getFileExtension(mimeType: string) {
  const mimeToExt = {
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'text/plain': 'txt',
    'application/zip': 'zip',
    'application/json': 'json',
    'text/csv': 'csv',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
  };

  // @ts-ignore
  return mimeToExt[mimeType] || 'bin'; // 默认使用 .bin 扩展名
}

/**
 * 根据 URL 生成带正确扩展名的文件名
 * @param url 下载路径
 * @param extension 扩展名
 */
function generateFilename(url: string, extension: string) {
  try {
    const urlObj = new URL(url);
    let filename = urlObj.pathname.split('/').pop() || 'download';

    // 移除原有扩展名
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex > 0) {
      filename = filename.substring(0, lastDotIndex);
    }

    return `${filename}.${extension}`;
  } catch (e) {
    // 处理无效 URL 的情况
    return `download.${extension}`;
  }
}
