import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from "element-plus";
import login from '../views/login.vue'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        //登录页
        {
            path: '/',
            name: 'login',
            component: login
        },
        //护士端-科室操作
        {
            path: '/nurseDepartment',
            name: 'nurseDepartment',
            component: () => import('../views/nurse/nurseDepartment.vue'),
            meta: {
                title: "排队叫号管理系统-护士端"
            }
        },
        //护士端-诊室操作
        {
            path: '/nurseConsult',
            name: 'nurseConsult',
            component: () => import('../views/nurse/nurseConsult.vue'),
            meta: {
                title: "排队叫号管理系统-护士端"
            }
        },
        //药房端—管理端大屏显示
        {
            path: '/drugstore',
            name: 'drugstore',
            component: () => import('../views/drugstore/drugstore.vue'),
            meta: {
                title: "排队叫号管理系统-药房大屏"
            }
        },
        //药房端-窗口显示概念图
        {
            path: '/drugstoreDevise',
            name: 'drugstoreDevise',
            component: () => import('../views/drugstore/drugstoreDevise.vue'),
            meta: {
                title: "排队叫号管理系统-药品窗口屏"
            }
        },
        //药房端-总屏显示概念图
        {
            path: '/drugstoreGeneralScreen',
            name: 'drugstoreGeneralScreen',
            component: () => import('../views/drugstore/drugstoreGeneralScreen.vue'),
            meta: {
                title: "排队叫号管理系统-药房总屏"
            }
        },
        //医生端
        {
            path: '/doctor',
            name: 'doctor',
            component: () => import('../views/doctor/doctor.vue'),
            meta: {
                title: "排队叫号管理系统-医生端"
            }
        },
        //一级屏
        {
            path: '/generalScreen',
            name: 'generalScreen',
            component: () => import('../views/screen/generalScreen.vue'),
            meta: {
                title: "排队叫号管理系统-一级屏"
            }
        },
        //大屏
        {
            path: '/primaryScreen',
            name: 'primaryScreen',
            component: () => import('../views/screen/primaryScreen.vue'),
            meta: {
                title: "排队叫号管理系统-大屏"
            }
        },
        //二级屏
        {
            path: '/secondaryScreen',
            name: 'secondaryScreen',
            component: () => import('../views/screen/secondaryScreen.vue'),
            meta: {
                title: "排队叫号管理系统-二级屏"
            }
        },
    ]
})

//需要登录才能进的页面,白名单
const whiteList = ['/doctor', '/nurseDepartment', '/nurseConsult']
router.beforeEach((to, from, next) => {
    //切换标签
    window.document.title = to.meta.title ? to.meta.title as any : '排队叫号系统';
    const userInfo = JSON.parse(localStorage.getItem('userInfo') as any);
    //判断是否有权限返回登录界面
    //1.进入医生端type是否为01
    //2.进入护士端type是否为02
    //3.进入其他页面直接放行
    if ((to.path === '/doctor' && userInfo?.staffType === '01')
        || ((to.path === '/nurseDepartment' || to.path === '/nurseConsult') && userInfo?.staffType === '02')
        || (whiteList.indexOf(to.path) < 0)) {
        next();
    } else {
        ElMessage('您无权限进入此页面！');
        next('/')
    }

})

export default router
