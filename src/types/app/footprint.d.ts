export interface Footprint {
  id: number;
  title: string;
  address: string;
  content: string;
  position: string;
  images: string | string[];
  createTime?: string | Dayjs;
}

export interface FilterForm {
  address?: string;
  createTime: Date[];
}
