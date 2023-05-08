/**
 * websocket封装
 */
export let socket = {
    // 初始化websocket对象,避免属性泄露
    initData: () => {
        return {
            wsUrl: "ws://192.168.124.75:6480/websocket/11", // websocket 默认连接地址
            websocket: null as any, // 用于存储实例化后websocket
            isConnect: false, // 连接标识 避免重复连接
            rec: null as any, // 断线重连后，延迟5秒重新创建WebSocket连接  rec用来存储延迟请求的代码
        }
    },

    //建立websocket连接
    createWebSocket: (url: string, receiveMessage: Function) => {
        let socketObj = socket.initData();
        socketObj.wsUrl = url ? url : socketObj.wsUrl;
        // 判断当前浏览器是否支持WebSocket
        if (!("WebSocket" in window) && !("MozWebSocket" in window)) {
            console.log("当前浏览器不支持websocket！");
            return null;
        }
        try {
            socketObj.websocket = new WebSocket(socketObj.wsUrl);
            console.log("websocket:", socketObj.websocket);

            //刚连接时
            socketObj.websocket.onopen = function (e: any) {
                console.log("连接成功");
                socketObj.isConnect = true;
            };

            // 接收
            socketObj.websocket.onmessage = function (e: any) {
                if (typeof receiveMessage != 'undefined')
                    receiveMessage(e)
            };

            // 连接发生错误
            socketObj.websocket.onerror = function () {
                console.log("WebSocket连接发生错误");
                socketObj.isConnect = false; // 连接断开修改标识
                socket.reConnect(socketObj,receiveMessage); // 连接错误 需要重连
            };

            //关闭
            socketObj.websocket.onclose = function (e: any) {
                socketObj.isConnect = false; // 断开后修改标识
                console.log("connection closed (" + e.code + ")");
                socket.reConnect(socketObj,receiveMessage);
            };
            return socketObj.websocket;
        } catch (e) {
            console.log("尝试创建连接失败");
            socket.reConnect(socketObj,receiveMessage); // 如果无法连接上 webSocket 那么重新连接！可能会因为服务器重新部署，或者短暂断网等导致无法创建连接
        }
    },

    // 定义重连函数
    reConnect: (socketObj:any,receiveMessage:Function) => {
        if (socketObj.isConnect) return; // 如果已经连上就不在重连了
        socketObj.rec && clearTimeout(socketObj.rec);
        console.log("尝试重新连接");
        socketObj.rec = setTimeout(function () {
            // 延迟30秒重连  避免过多次过频繁请求重连
            socket.createWebSocket(socketObj.wsUrl, receiveMessage);
        }, 30000);
    },

    // 发送
    sendWebSocket: (websocket: any, data: any) => {
        if (websocket.readyState === websocket.OPEN) { // 开启状态
            console.log("发送的数据", data, JSON.stringify(data));
            websocket.send(JSON.stringify(data));
        } else { // 若 未开启 / 正在开启 状态 ，则等待1s后重新调用
            setTimeout(function () {
                socket.sendWebSocket(websocket, data);
            }, 1000);
        }
    },

    // 关闭
    closeWebSocket: (websocket: any) => {
        websocket.close();
    },
}
