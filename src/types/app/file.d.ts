export type DirList = ('default' | 'article' | 'swiper' | string)

export interface File {
    name: string;
    size: number;
    type: string;
    url: string;
    createTime: number;
}

export interface FileDir {
    path: string;
    name: string;
    icon?: string;
}