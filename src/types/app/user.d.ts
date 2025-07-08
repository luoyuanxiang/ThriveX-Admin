export interface Login {
    username: string,
    password: string
}

export interface UserInfo {
    id?: number,
    name: string,
    email: string,
    avatar: string,
    info: string,
    role: Role,
    roleId?: number
}

export type User = Login & UserInfo & { createTime?: string }

export interface LoginReturn {
    token: string,
    user: User,
    role: Role
}

export interface EditUser {
    oldUsername: string,
    newUsername: string,
    oldPassword: string,
    newPassword: string
}


export interface FilterForm {
    name?: string,
    role?: number,
    createTime: Date[]
}

export interface FilterUser extends FilterData {
    name?: string,
    roleId?: number,
}