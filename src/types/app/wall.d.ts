export interface Cate {
  id: number;
  name: string;
  mark: string;
  order: number;
}

export interface Wall {
  id: number;
  name: string;
  cateId: number;
  cate: Category;
  color: string;
  content: string;
  email: string;
  auditStatus: number;
  isChoice: number;
  createTime: string;
}

export interface FilterForm {
  content?: string;
  cateId?: number;
  createTime: Date[];
}

export interface FilterWall extends FilterData {
  content?: string;
  cateId?: number;
}
