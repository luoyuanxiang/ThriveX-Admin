// 网站信息
export interface WebFormValues {
  url: string;
  title: string;
  subhead: string;
  favicon: string;
  description: string;
  keyword: string;
  footer: string;
  icp?: string;
  create_time?: number;
  lantern: boolean;
  dynamicTitle: boolean;
  leaveTitle: string;
  backTitle: string;
  grayscaleDates: string;
}