<!--
* @FileDescription: 登录页面
* @router: /
* @Author: 刘润泽
* @Date: 2023-03-13
* @LastEditors: 刘润泽、王欣
* @LastEditTime：2023-03-21
-->
<template>
	<div class="login">
		<el-row style="height: 100%">
			<el-col :span="12" class="login_layout" style="padding-left: 15%">
				<div class="welcome">WELCOME</div>
				<div class="title">排队叫号系统</div>
				<img class="login_left" src="../assets/images/login_left.png" alt="" />
				<div class="describe">营造良好的就医环境，展现医疗服务的现代化管理</div>
			</el-col>
			<el-col :span="12" class="login_layout">
				<div class="login-card">
					<div class="login-wrapper">
						<div class="header">欢迎登录</div>
						<div class="input-area">
							<el-input type="text" v-model="username" placeholder="请输入登录账号" :prefix-icon="User" />
						</div>
						<div class="input-area">
							<el-input type="password" v-model="password" placeholder="请输入密码" :prefix-icon="Lock" />
						</div>
						<!-- <el-checkbox label="记住密码" size="large" /> -->
						<el-button type="primary" @click="login">登录</el-button>
					</div>
				</div>
			</el-col>
		</el-row>
		<div class="footer">2023 世轩科技 版权所有</div>
	</div>
</template>

<script setup lang="ts">
import { User, Lock } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { sm4 } from "sm-crypto";

let username = ref("");
let password = ref("");

//使用路由
const router = useRouter();
//获取代理
const { proxy } = getCurrentInstance() as any;

//密钥
const SM4_key = [0x53, 0x45, 0x53, 0x41, 0x4e, 0x2e, 0x59, 0x47, 0x54, 0x2e, 0x53, 0x4d, 0x34, 0x2e, 0x45, 0x44]; // SESAN.YGT.SM4.ED
/**
 * SM4加密
 * @param  {String} 明文
 * @returns 密文
 */
const encryptWithSM4 = (str: string) => {
	let sm4Encrypt = sm4.encrypt(str, SM4_key);
	return sm4Encrypt;
};

onMounted(() => {
	// let userInfo = JSON.parse(localStorage.getItem("userInfo") as any);
	// if (userInfo) {
	// 	routerPush(userInfo);
	// }
});
/**
 * 判断路由跳转
 */
const routerPush = (data: any) => {
	if (data.staffType === "01") {
		router.push("/doctor");
	} else if (data.staffType === "02") {
		router.push("/nurseDepartment");
	} else if (data.staffType === "03") {
		router.push("/drugstore");
	} else {
		ElMessage({ message: "您无登录权限！", type: "warning" });
	}
};

/**
 * 登录
 */
const login = () => {
	if (!username.value) {
		ElMessage({ message: "请输入用户名！", type: "warning" });
		return;
	}
	if (!password.value) {
		ElMessage({ message: "请输入密码！", type: "warning" });
		return;
	}
	proxy.$axios
		.post("/login", {
			staffId: username.value,
			staffPassword: encryptWithSM4(password.value),
		})
		.then((res: any) => {
			if (res?.data?.data && res?.data?.status == "ok") {
				let tempData = res.data.data;
				localStorage.removeItem("userInfo");
				localStorage.setItem("userInfo", JSON.stringify(tempData));
                ElMessage({ message: '登录成功！', type: "success" });
				routerPush(tempData);
			} else {
				ElMessage({ message: res.data.data, type: "error" });
			}
		});
};
</script>

<style lang="scss">
.login {
	width: 100%;
	height: 100%;
	background: url("../assets/images/login.png");
	&::before {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		background: linear-gradient(155deg, #65c4f2 0%, #0460b4 100%);
		opacity: 0.86;
	}
	.login_layout {
		display: flex;
		justify-content: center; /*水平居中*/
		flex-direction: column;
	}
	.welcome {
		font-size: 34px;
		opacity: 0.3;
		color: #fff;
		margin-bottom: 4px;
	}
	.login_left {
		width: 310px;
		height: 50px;
		object-fit: contain;
		margin-bottom: 20px;
	}
	.describe {
		color: #fff;
		font-size: 18px;
	}
	.title {
		font-size: 48px;
		color: #ffffff;
		width: 50%;
		font-weight: bold;
		min-width: 400px;
	}
	.login-card {
		display: flex;
		justify-content: center;
		align-items: center;
		padding-right: 40px;
		.login-wrapper {
			width: 290px;
			height: 440px;
			background: #ffffff;
			padding: 60px 70px 0 70px;
			.header {
				font-size: 24px;
				font-weight: bold;
				text-align: center;
				margin-bottom: 60px;
			}
			.input-area {
				border-radius: 5px;
				width: 100%;
				height: 56px;
				margin-bottom: 30px;
				.el-input__wrapper {
					background-color: #eff6ff;
				}
				input {
					height: 56px;
					float: right;
					&::-webkit-input-placeholder {
						font-size: 16px;
						font-weight: 400;
						color: rgba(50, 50, 51, 0.6);
						line-height: 24px;
					}
				}
			}
			.el-checkbox {
				margin-bottom: 60px;
			}
			.el-button {
				display: block;
				width: 100%;
				height: 54px;
				background: #0251c6;
				box-shadow: 0 16px 32px 0 rgba(55, 159, 254, 0.31);
				border-radius: 4px;
				font-size: 18px;
				letter-spacing: 8px;
			}
		}
	}
	.footer {
		position: absolute;
		bottom: 10px;
		width: 100%;
		text-align: center;
		font-size: 14px;
		font-weight: 400;
		color: #ffffff;
		z-index: 3;
	}
}
</style>
