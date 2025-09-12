export interface Comment {
  id?: number;
  name: string;
  avatar: string;
  email: string | null;
  url: string;
  content: string;
  articleId: number;
  articleTitle?: string;
  commentId: number;
  auditStatus: number;
  createTime: string;
}

export interface Info {
  tab: string;
  loading: boolean;
  list: Comment[];
  paginate: Page;
}

export interface FilterForm {
  title?: string;
  content?: string;
  createTime: Date[];
}
