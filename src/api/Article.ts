import Request from '@/utils/request';
import { Article, FilterArticle } from '@/types/app/article';

// 新增文章
export const addArticleDataAPI = (data: Article) =>
  Request('POST', '/article', { data });

// 删除文章
export const delArticleDataAPI = (id: number, isDel?: boolean) =>
  Request('DELETE', isDel ? `/article/${id}/1` : `/article/${id}/0`);

// 批量删除文章
export const delBatchArticleDataAPI = (ids: number[]) =>
  Request('DELETE', '/article/batch', { data: ids});
// 还原被删除的文章
export const reductionArticleDataAPI = (id: number) =>
  Request('PATCH', `/article/reduction/${id}`);

// 编辑文章
export const editArticleDataAPI = (data: Article) =>
  Request('PATCH', '/article', { data });

// 获取文章
export const getArticleDataAPI = (id?: number) => Request<Article>('GET', `/article/${id}`)

// 获取文章列表
export const getArticleListAPI = (data?: QueryData<FilterArticle>) => Request<Article[]>('POST', `/article/list`, {
  data: { ...data?.query }
})

// 分页获取文章列表
export const getArticlePagingAPI = (data?: QueryData) => Request<Paginate<Article[]>>('POST', `/article/paging`, {
  data: { ...data?.query },
  params: {
    ...data?.pagination
  }
})

// 导入文章
export const importArticleDataAPI = (list: File[]) => {
    const formData = new FormData();

    list.forEach((file) => {
        formData.append(`list`, file);
    });

    return Request('POST', '/article/import', { 
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}