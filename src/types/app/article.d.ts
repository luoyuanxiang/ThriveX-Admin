import { Cate } from './cate';
import { Tag } from './tag';

export type Status = 'default' | 'no_home' | 'hide';

export interface Article {
  id?: number;
  title: string;
  description: string;
  content: string;
  cover: string;
  cateIds: number[];
  cateList?: Cate[];
  tagIds: number[];
  tagList?: Tag[];
  view?: number;
  comment?: number;
  createTime?: string;
  status: Status;
  password: string;
  isEncrypt: number;
  isDraft: number;
  isDel: number;
}

export interface FilterForm {
  title?: string;
  cateId?: number;
  tagId?: number;
  createTime: Date[];
}

export interface FilterArticle extends FilterData {
  cateId?: number;
  tagId?: number;
  isDraft?: number;
  isDel?: number;
}
