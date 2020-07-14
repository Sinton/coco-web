import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/layouts'
import { bxAnaalyse, cocoSwarm, cocoKubernetes } from '@/core/icons'

export const asyncRouterMap = [

  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/dashboard/workplace',
    children: [
      // dashboard
      {
        path: '/dashboard',
        name: 'dashboard',
        redirect: '/dashboard/workplace',
        component: RouteView,
        hideChildrenInMenu: false,
        meta: { title: '仪表盘', keepAlive: true, icon: 'dashboard', permission: [ 'dashboard' ] },
        children: [
          {
            path: '/dashboard/analysis',
            name: 'Analysis',
            component: () => import('@/views/dashboard/Analysis'),
            meta: { title: '分析页', keepAlive: false, permission: [ 'dashboard' ] }
          },
          {
            path: '/dashboard/workplace',
            name: 'Workplace',
            component: () => import('@/views/dashboard/Workplace'),
            meta: { title: '工作台', keepAlive: true, permission: [ 'dashboard' ] }
          }
        ]
      },

      // forms
      {
        path: '/form',
        redirect: '/form/base-form',
        component: PageView,
        meta: { title: '表单页', icon: 'form', permission: [ 'form' ] },
        hidden: true,
        children: [
          {
            path: '/form/base-form',
            name: 'BaseForm',
            component: () => import('@/views/form/BasicForm'),
            meta: { title: '基础表单', keepAlive: true, permission: [ 'form' ] }
          },
          {
            path: '/form/step-form',
            name: 'StepForm',
            component: () => import('@/views/form/stepForm/StepForm'),
            meta: { title: '分步表单', keepAlive: true, permission: [ 'form' ] }
          },
          {
            path: '/form/advanced-form',
            name: 'AdvanceForm',
            component: () => import('@/views/form/advancedForm/AdvancedForm'),
            meta: { title: '高级表单', keepAlive: true, permission: [ 'form' ] }
          }
        ]
      },

      // list
      {
        path: '/list',
        name: 'list',
        component: PageView,
        redirect: '/list/table-list',
        meta: { title: '列表页', icon: 'table', permission: [ 'table' ] },
        hidden: true,
        children: [
          {
            path: '/list/table-list/:pageNo([1-9]\\d*)?',
            name: 'TableListWrapper',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/list/TableList'),
            meta: { title: '查询表格', keepAlive: true, permission: [ 'table' ] }
          },
          {
            path: '/list/basic-list',
            name: 'BasicList',
            component: () => import('@/views/list/StandardList'),
            meta: { title: '标准列表', keepAlive: true, permission: [ 'table' ] }
          },
          {
            path: '/list/card',
            name: 'CardList',
            component: () => import('@/views/list/CardList'),
            meta: { title: '卡片列表', keepAlive: true, permission: [ 'table' ] }
          },
          {
            path: '/list/search',
            name: 'SearchList',
            component: () => import('@/views/list/search/SearchLayout'),
            redirect: '/list/search/article',
            meta: { title: '搜索列表', keepAlive: true, permission: [ 'table' ] },
            children: [
              {
                path: '/list/search/article',
                name: 'SearchArticles',
                component: () => import('../views/list/search/Article'),
                meta: { title: '搜索列表（文章）', permission: [ 'table' ] }
              },
              {
                path: '/list/search/project',
                name: 'SearchProjects',
                component: () => import('../views/list/search/Projects'),
                meta: { title: '搜索列表（项目）', permission: [ 'table' ] }
              },
              {
                path: '/list/search/application',
                name: 'SearchApplications',
                component: () => import('../views/list/search/Applications'),
                meta: { title: '搜索列表（应用）', permission: [ 'table' ] }
              }
            ]
          }
        ]
      },

      // profile
      {
        path: '/profile',
        name: 'profile',
        component: RouteView,
        redirect: '/profile/basic',
        meta: { title: '详情页', icon: 'profile', permission: [ 'profile' ] },
        hidden: true,
        children: [
          {
            path: '/profile/basic',
            name: 'ProfileBasic',
            component: () => import('@/views/profile/basic/Index'),
            meta: { title: '基础详情页', permission: [ 'profile' ] }
          },
          {
            path: '/profile/advanced',
            name: 'ProfileAdvanced',
            component: () => import('@/views/profile/advanced/Advanced'),
            meta: { title: '高级详情页', permission: [ 'profile' ] }
          }
        ]
      },

      // result
      {
        path: '/result',
        name: 'result',
        component: PageView,
        redirect: '/result/success',
        meta: { title: '结果页', icon: 'check-circle-o', permission: [ 'result' ] },
        hidden: true,
        children: [
          {
            path: '/result/success',
            name: 'ResultSuccess',
            component: () => import(/* webpackChunkName: "result" */ '@/views/result/Success'),
            meta: { title: '成功', keepAlive: false, hiddenHeaderContent: true, permission: [ 'result' ] }
          },
          {
            path: '/result/fail',
            name: 'ResultFail',
            component: () => import(/* webpackChunkName: "result" */ '@/views/result/Error'),
            meta: { title: '失败', keepAlive: false, hiddenHeaderContent: true, permission: [ 'result' ] }
          }
        ]
      },

      // Exception
      {
        path: '/exception',
        name: 'exception',
        component: RouteView,
        redirect: '/exception/403',
        meta: { title: '异常页', icon: 'warning', permission: [ 'exception' ] },
        hidden: true,
        children: [
          {
            path: '/exception/403',
            name: 'Exception403',
            component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
            meta: { title: '403', permission: [ 'exception' ] }
          },
          {
            path: '/exception/404',
            name: 'Exception404',
            component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
            meta: { title: '404', permission: [ 'exception' ] }
          },
          {
            path: '/exception/500',
            name: 'Exception500',
            component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),
            meta: { title: '500', permission: [ 'exception' ] }
          }
        ]
      },

      // account
      {
        path: '/account',
        component: RouteView,
        redirect: '/account/center',
        name: 'account',
        meta: { title: '个人页', icon: 'user', keepAlive: true, permission: [ 'user' ] },
        hidden: true,
        children: [
          {
            path: '/account/center',
            name: 'center',
            component: () => import('@/views/account/center/Index'),
            meta: { title: '个人中心', keepAlive: true, permission: [ 'user' ] }
          },
          {
            path: '/account/settings',
            name: 'settings',
            component: () => import('@/views/account/settings/Index'),
            meta: { title: '个人设置', hideHeader: true, permission: [ 'user' ] },
            redirect: '/account/settings/base',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/account/settings/base',
                name: 'BaseSettings',
                component: () => import('@/views/account/settings/BaseSetting'),
                meta: { title: '基本设置', hidden: true, permission: [ 'user' ] }
              },
              {
                path: '/account/settings/security',
                name: 'SecuritySettings',
                component: () => import('@/views/account/settings/Security'),
                meta: { title: '安全设置', hidden: true, keepAlive: true, permission: [ 'user' ] }
              },
              {
                path: '/account/settings/custom',
                name: 'CustomSettings',
                component: () => import('@/views/account/settings/Custom'),
                meta: { title: '个性化设置', hidden: true, keepAlive: true, permission: [ 'user' ] }
              },
              {
                path: '/account/settings/binding',
                name: 'BindingSettings',
                component: () => import('@/views/account/settings/Binding'),
                meta: { title: '账户绑定', hidden: true, keepAlive: true, permission: [ 'user' ] }
              },
              {
                path: '/account/settings/notification',
                name: 'NotificationSettings',
                component: () => import('@/views/account/settings/Notification'),
                meta: { title: '新消息通知', hidden: true, keepAlive: true, permission: [ 'user' ] }
              }
            ]
          }
        ]
      },

      // other
      {
        path: '/other',
        name: 'otherPage',
        component: PageView,
        meta: { title: '其他组件', icon: 'slack', permission: [ 'dashboard' ] },
        hidden: true,
        redirect: '/other/icon-selector',
        children: [
          {
            path: '/other/icon-selector',
            name: 'TestIconSelect',
            component: () => import('@/views/other/IconSelectorView'),
            meta: { title: 'IconSelector', icon: 'tool', keepAlive: true, permission: [ 'dashboard' ] }
          },
          {
            path: '/other/list',
            component: RouteView,
            meta: { title: '业务布局', icon: 'layout', permission: [ 'support' ] },
            redirect: '/other/list/tree-list',
            children: [
              {
                path: '/other/list/tree-list',
                name: 'TreeList',
                component: () => import('@/views/other/TreeList'),
                meta: { title: '树目录表格', keepAlive: true }
              },
              {
                path: '/other/list/edit-table',
                name: 'EditList',
                component: () => import('@/views/other/TableInnerEditList'),
                meta: { title: '内联编辑表格', keepAlive: true }
              },
              {
                path: '/other/list/user-list',
                name: 'UserList',
                component: () => import('@/views/other/UserList'),
                meta: { title: '用户列表', keepAlive: true }
              },
              {
                path: '/other/list/role-list',
                name: 'RoleList',
                component: () => import('@/views/other/RoleList'),
                meta: { title: '角色列表', keepAlive: true }
              },
              {
                path: '/other/list/system-role',
                name: 'SystemRole',
                component: () => import('@/views/role/RoleList'),
                meta: { title: '角色列表2', keepAlive: true }
              },
              {
                path: '/other/list/permission-list',
                name: 'PermissionList',
                component: () => import('@/views/other/PermissionList'),
                meta: { title: '权限列表', keepAlive: true }
              }
            ]
          }
        ]
      },

      // apps
      {
        path: '/apps',
        name: 'apps',
        component: RouteView,
        meta: { title: '应用', icon: 'appstore' },
        children: [
          {
            path: '/apps/stores',
            name: 'Stores',
            component: () => import(/* webpackChunkName: "Stores" */ '@/views/apps/stores'),
            meta: { title: '应用商店', keepAlive: false, hiddenHeaderContent: false }
          },
          {
            path: '/apps/templates',
            name: 'Templates',
            component: () => import(/* webpackChunkName: "Templates" */ '@/views/apps/templates'),
            meta: { title: '应用模板', keepAlive: false, hiddenHeaderContent: false }
          },
          {
            path: '/apps/pipelines',
            name: 'Pipelines',
            component: () => import(/* webpackChunkName: "Pipelines" */ '@/views/apps/pipelines'),
            meta: { title: 'Pipeline 模板', keepAlive: true, hiddenHeaderContent: false }
          }
        ]
      },

      // resources
      {
        path: '/resources',
        name: 'resources',
        component: RouteView,
        meta: { title: '共享资源', icon: 'share-alt' },
        children: [
          {
            path: '/resources/stacks',
            name: 'Stacks',
            component: RouteView,
            meta: { title: '应用栈', keepAlive: false, hiddenHeaderContent: false },
            redirect: '/resources/stacks',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/resources/stacks',
                name: 'StacksList',
                component: () => import(/* webpackChunkName: "StacksList" */ '@/views/resources/stacks'),
                meta: { title: '应用栈列表', keepAlive: false }
              }
            ]
          },
          {
            path: '/resources/images',
            name: 'Images',
            component: RouteView,
            meta: { title: '镜像', keepAlive: false, hiddenHeaderContent: false },
            redirect: '/resources/images',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/resources/images',
                name: 'ImagesList',
                component: () => import(/* webpackChunkName: "ImagesList" */ '@/views/resources/images'),
                meta: { title: '镜像', keepAlive: true }
              },
              {
                path: '/resources/images/:id',
                name: 'ImageDetails',
                component: () => import(/* webpackChunkName: "ImageDetails" */ '@/views/resources/images/details'),
                meta: { title: '镜像详情', keepAlive: false }
              }
            ]
          },
          {
            path: '/resources/containers',
            name: 'Containers',
            component: RouteView,
            meta: { title: '容器', keepAlive: false, hiddenHeaderContent: false },
            redirect: '/resources/containers',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/resources/containers',
                name: 'ContainersList',
                component: () => import(/* webpackChunkName: "ContainersList" */ '@/views/resources/containers'),
                meta: { title: '容器列表', keepAlive: false }
              },
              {
                path: '/resources/containers/:id',
                name: 'ContainerDetails',
                component: () => import(/* webpackChunkName: "ContainerDetails" */ '@/views/resources/containers/details'),
                meta: { title: '容器详情', keepAlive: false }
              },
              {
                path: '/resources/containers/:id/statistics',
                name: 'ContainerStatistics',
                component: () => import(/* webpackChunkName: "ContainerStatistics" */ '@/views/resources/containers/statistics'),
                meta: { title: '容器监控统计', keepAlive: false }
              },
              {
                path: '/resources/containers/deploy',
                name: 'ContainerDeploy',
                component: () => import(/* webpackChunkName: "ContainerDeploy" */ '@/views/resources/containers/deploy'),
                meta: { title: '容器部署', keepAlive: false }
              }
            ]
          },
          {
            path: '/resources/networks',
            name: 'Networks',
            component: RouteView,
            meta: { title: '网络', keepAlive: false, hiddenHeaderContent: false },
            redirect: '/resources/networks',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/resources/networks',
                name: 'NetworksList',
                component: () => import(/* webpackChunkName: "NetworksList" */ '@/views/resources/networks'),
                meta: { title: '网络列表', keepAlive: false }
              },
              {
                path: '/resources/networks/:id',
                name: 'NetworkDetails',
                component: () => import(/* webpackChunkName: "NetworkDetails" */ '@/views/resources/networks/details'),
                meta: { title: '网络详情', keepAlive: false }
              }
            ]
          },
          {
            path: '/resources/volumes',
            name: 'Volumes',
            component: RouteView,
            meta: { title: '存储卷', keepAlive: false, hiddenHeaderContent: false },
            redirect: '/resources/volumes',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/resources/volumes',
                name: 'VolumesList',
                component: () => import(/* webpackChunkName: "VolumesList" */ '@/views/resources/volumes'),
                meta: { title: '存储卷列表', keepAlive: false }
              },
              {
                path: '/resources/volumes/:name',
                name: 'VolumeDetails',
                component: () => import(/* webpackChunkName: "VolumeDetails" */ '@/views/resources/volumes/details'),
                meta: { title: '存储卷详情', keepAlive: false }
              }
            ]
          }
        ]
      },

      // swarm
      {
        path: '/swarm',
        name: 'swarm',
        component: RouteView,
        meta: { title: 'Swarm 编排调度', icon: cocoSwarm },
        children: [
          {
            path: '/swarm/nodes',
            name: 'Nodes',
            component: RouteView,
            meta: { title: '集群节点', keepAlive: false, hiddenHeaderContent: false },
            redirect: '/swarm/nodes',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/swarm/nodes',
                name: 'NodesList',
                component: () => import(/* webpackChunkName: "NodesList" */ '@/views/swarm/nodes'),
                meta: { title: '集群节点列表', keepAlive: false }
              },
              {
                path: '/swarm/nodes/:id',
                name: 'NodeDetails',
                component: () => import(/* webpackChunkName: "NodeDetails" */ '@/views/swarm/nodes/details'),
                meta: { title: '集群节点详情', keepAlive: false }
              }
            ]
          },
          {
            path: '/swarm/services',
            name: 'Services',
            component: RouteView,
            meta: { title: '服务', keepAlive: false, hiddenHeaderContent: false },
            redirect: '/swarm/services',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/swarm/services',
                name: 'ServicesList',
                component: () => import(/* webpackChunkName: "ServicesList" */ '@/views/swarm/services'),
                meta: { title: '服务列表', keepAlive: false }
              },
              {
                path: '/swarm/services/:id',
                name: 'ServiceDetails',
                component: () => import(/* webpackChunkName: "ServiceDetails" */ '@/views/swarm/services/details'),
                meta: { title: '服务详情', keepAlive: false }
              }
            ]
          },
          {
            path: '/swarm/configs',
            name: 'Configs',
            component: RouteView,
            meta: { title: '配置项', keepAlive: false, hiddenHeaderContent: false },
            redirect: '/swarm/configs',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/swarm/configs',
                name: 'ConfigsList',
                component: () => import(/* webpackChunkName: "ConfigsList" */ '@/views/swarm/configs'),
                meta: { title: '配置项列表', keepAlive: false }
              }
            ]
          },
          {
            path: '/swarm/secrets',
            name: 'Secrets',
            component: RouteView,
            meta: { title: '加密配置项', keepAlive: false, hiddenHeaderContent: false },
            redirect: '/swarm/secrets',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/swarm/secrets',
                name: 'SecretsList',
                component: () => import(/* webpackChunkName: "SecretsList" */ '@/views/swarm/secrets'),
                meta: { title: '加密配置项列表', keepAlive: false }
              }
            ]
          }
        ]
      },

      // kubernetes
      {
        path: '/kubernetes',
        name: 'kubernetes',
        component: PageView,
        meta: { title: 'Kubernetes 编排调度', icon: cocoKubernetes }
      },

      // setting
      {
        path: '/setting',
        name: 'setting',
        component: RouteView,
        meta: { title: '设置', icon: 'setting' },
        children: [
          {
            path: '/setting/endpoints',
            name: 'Endpoints',
            component: () => import(/* webpackChunkName: "Endpoints" */ '@/views/setting/endpoints'),
            meta: { title: '服务终端', keepAlive: false }
          },
          {
            path: '/setting/registrys',
            name: 'Registrys',
            component: () => import(/* webpackChunkName: "Registrys" */ '@/views/setting/registrys'),
            meta: { title: '镜像仓库', keepAlive: false }
          },
          {
            path: '/setting/config',
            name: 'Config',
            component: () => import(/* webpackChunkName: "Config" */ '@/views/setting/config'),
            meta: { title: '参数配置', keepAlive: false }
          },
          {
            path: '/setting/about',
            name: 'About',
            component: () => import(/* webpackChunkName: "About" */ '@/views/setting/about'),
            meta: { title: '关于', keepAlive: false }
          },
          {
            path: '/setting/changelog',
            name: 'Changelog',
            component: () => import(/* webpackChunkName: "Changelog" */ '@/views/setting/changelog'),
            meta: { title: '更新日志', keepAlive: false }
          }
        ]
      }
    ]
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      }
    ]
  },

  {
    path: '/test',
    component: BlankLayout,
    redirect: '/test/home',
    children: [
      {
        path: 'home',
        name: 'TestHome',
        component: () => import('@/views/Home')
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
