import { Permission } from '@/types/app/permission';

// 判断是否有权限
export const useHasPermission = (code: string) => {
    const permission = JSON.parse(localStorage.getItem('user_storage') || '{}')?.state?.permission;
    return permission?.some((permission: Permission) => permission.name === code);
}

export default {
    user: {
        add: useHasPermission('user:add'),
        del: useHasPermission('user:del'),
        edit: useHasPermission('user:edit'),
        info: useHasPermission('user:info'),
        list: useHasPermission('user:list'),
        pass: useHasPermission('user:pass')
    },
    data: {
        add: useHasPermission('data:add'),
        del: useHasPermission('data:del')
    },
    article: {
        add: useHasPermission('article:add'),
        del: useHasPermission('article:del'),
        reduction: useHasPermission('article:reduction'),
        edit: useHasPermission('article:edit')
    },
    cate: {
        add: useHasPermission('cate:add'),
        del: useHasPermission('cate:del'),
        edit: useHasPermission('cate:edit')
    },
    comment: {
        del: useHasPermission('comment:del'),
        edit: useHasPermission('comment:edit'),
        audit: useHasPermission('comment:audit')
    },
    config: {
        edit: useHasPermission('config:edit')
    },
    email: {
        dismiss: useHasPermission('email:dismiss')
    },
    file: {
        info: useHasPermission('file:info'),
        dir: useHasPermission('file:dir'),
        list: useHasPermission('file:list'),
        add: useHasPermission('file:add'),
        del: useHasPermission('file:del')
    },
    oss: {
        add: useHasPermission('oss:add'),
        del: useHasPermission('oss:del'),
        edit: useHasPermission('oss:edit'),
        info: useHasPermission('oss:info'),
        list: useHasPermission('oss:list'),
        enable: useHasPermission('oss:enable'),
        getEnableOss: useHasPermission('oss:getEnableOss'),
        getPlatform: useHasPermission('oss:getPlatform')
    },
    record: {
        add: useHasPermission('record:add'),
        del: useHasPermission('record:del'),
        edit: useHasPermission('record:edit')
    },
    role: {
        add: useHasPermission('role:add'),
        del: useHasPermission('role:del'),
        edit: useHasPermission('role:edit'),
        info: useHasPermission('role:info'),
        list: useHasPermission('role:list'),
        bindingRoute: useHasPermission('role:bindingRoute')
    },
    route: {
        add: useHasPermission('route:add'),
        del: useHasPermission('route:del'),
        edit: useHasPermission('route:edit'),
        info: useHasPermission('route:info'),
        list: useHasPermission('route:list')
    },
    swiper: {
        add: useHasPermission('swiper:add'),
        del: useHasPermission('swiper:del'),
        edit: useHasPermission('swiper:edit')
    },
    tag: {
        add: useHasPermission('tag:add'),
        del: useHasPermission('tag:del'),
        edit: useHasPermission('tag:edit')
    },
    wall: {
        del: useHasPermission('wall:del'),
        edit: useHasPermission('wall:edit'),
        audit: useHasPermission('wall:audit')
    },
    permission: {
        add: useHasPermission('permission:add'),
        del: useHasPermission('permission:del'),
        edit: useHasPermission('permission:edit'),
        info: useHasPermission('permission:info'),
        list: useHasPermission('permission:list')
    }
}