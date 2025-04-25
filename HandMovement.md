


## 项目运行

最近比较忙，过段时间写一篇详细的项目部署教程，这里先简单教大家在本地跑起来

**前端 or 控制端**

环境：Nodejs18 及以上

```
npm i
npm run dev
```

后台账号：`admin`   密码：`123456`



在控制端项目根目录下创建 `.env` 文件，添加如下配置

```bash
# 百度统计相关配置
VITE_BAIDU_TONGJI_KEY=
VITE_BAIDU_TONGJI_SECRET_KEY=
VITE_BAIDU_TONGJI_SITE_ID=
VITE_BAIDU_TONGJI_ACCESS_TOKEN=
VITE_BAIDU_TONGJI_REFRESH_TOKEN=

# 星火AI相关配置
VITE_AI_APIPASSWORD=
VITE_AI_MODEL=
```

百度接口申请地址：[https://tongji.baidu.com/api/manual/Chapter2/openapi.html](https://tongji.baidu.com/api/manual/Chapter2/openapi.html)

星火大模型接口申请地址：[https://www.xfyun.cn/](https://www.xfyun.cn/)



**后端**

环境：Java8 + MySQL8

安装 `maven` 依赖，配置 `application-dev.yml` 相关的信息

```yml
lyy:
  email:
    host: smtp.qq.com
    port: 465
    username: 你的邮箱账号
    password: 你的邮箱授权码

  oss:
    accessKey: 七牛云的accessKey
    secretKey: 七牛云的secretKey
    bucket: thrive
```

导入后端根目录的 `ThriveX.sql` 数据库文件，最后运行项目即可



## 项目部署

前端：[https://docs.liuyuyang.net/docs/项目部署/前端.html](https://docs.liuyuyang.net/docs/项目部署/前端.html)
控制端：[https://docs.liuyuyang.net/docs/项目部署/控制端.html](https://docs.liuyuyang.net/docs/项目部署/控制端.html)
后端：[https://docs.liuyuyang.net/docs/项目部署/后端.html](https://docs.liuyuyang.net/docs/项目部署/后端.html)



## 项目结构

```
├── public // 存放公共资源
├── src // 核心源码
│   ├── api // 所有API接口
│   ├── app
│   │   ├── error.tsx // 自定义错误页
│   │   ├── favicon.ico // 项目图标
│   │   ├── layout.tsx // 网站布局
│   │   ├── loading.tsx // 自定义加载页
│   │   ├── not-found.tsx // 自定义404页
│   │   ├── page.tsx // 首页
│   ├── assets // 存放项目所有资源
│   │   ├── font
│   │   ├── image
│   │   └── svg
│   ├── components // 公共组件
│   ├── stores // 数据全局共享
│   ├── styles // 全局样式
│   ├── types // 全局类型
│   └── utils // 通用方法
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```


