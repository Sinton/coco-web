[English](./README.md) | 简体中文

<h1 align="center">Docker CaaS 前端</h1>

<div align="center">
Docker devOps manager solution for enterprise applications
</div>

<div align="center">

[![Backers on Open Collective](https://opencollective.com/coco-web/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/ant-design-pro-vue/sponsors/badge.svg)](#sponsors) [![License](https://img.shields.io/npm/l/package.json.svg?style=flat)](https://github.com/sendya/ant-design-pro-vue/blob/master/LICENSE)
[![Release](https://img.shields.io/github/release/sendya/coco-web.svg?style=flat)](https://github.com/sinton/coco-web/releases/latest)
[![Travis branch](https://travis-ci.org/sendya/coco-web.svg?branch=master)](https://travis-ci.org/sendya/coco-web)

</div>

- 演示: https://demo.caas.0x1010.com
- 首页: https://caas.0x1010.com
- 文档: https://caas.0x1010.com/docs/getting-started
- 更新日志: https://caas.0x1010.com/docs/changelog
- 常见问题: https://caas.0x1010.com/docs/faq
- 分支:
  - feature/pro: 前端 Antdv 框架
  - feature/third-party-auth: LDAP、Github's OAuth 鉴权支持
  - feature/ic: 阿里云 ECS、亚马逊 AWS 云外管理支持


Overview
----

![stacks manager](./Screenshot/stack.png)

![images manager](./Screenshot/image.png)

![image details](./Screenshot/image_details.png)

![volumes manager](./Screenshot/volume.png)

![containers manager](./Screenshot/container.png)

![containers details](./Screenshot/container_details.png)

![containers status](./Screenshot/container_status.png)

![swarm cluster manager]()

![swarm service manager]()

![swarm config manager]()

![swarm secret manager]()

![notification]()

![permission list]()

![user profile]()

![setting]()


环境和依赖
----

- node
- yarn
- webpack
- eslint
- @vue/cli ~3
- [ant-design-vue](https://github.com/vueComponent/ant-design-vue) - Ant Design Of Vue 实现
- [ant-design-vue-pro](https://github.com/vueComponent/ant-design-pro-vue) - Ant Design Pro Of Vue 业务框架实现

> 请注意，我们强烈建议本项目使用 [Yarn](https://yarnpkg.com/) 包管理工具，这样可以与本项目演示站所加载完全相同的依赖版本 (yarn.lock) 。由于我们没有对依赖进行强制的版本控制，采用非 yarn 包管理进行引入时，可能由于 Pro 所依赖的库已经升级版本，而引入了新版本所照成的问题。作者可能会由于时间问题无法及时排查而导致您采用本项目作为基项目而出现问题。



项目下载和运行
----

- 拉取项目代码
```bash
git clone https://github.com/Sinton/coco-web.git
cd coco-web
```

- 安装依赖
```
yarn install
```

- 开发模式运行
```
yarn run serve
```

- 编译项目
```
yarn run build
```

- Lints and fixes files
```
yarn run lint
```



其他说明
----

- **关于 Issue 反馈 (重要!重要!重要!) 请在开 *Issue* 前，先阅读该内容：[Issue / PR 编写建议](https://github.com/Sinton/coco-web/issues/90)**
