/**
 * 将患者姓名中间部分替换为*
 * @param name 姓名
 */
function formatName(name: string) {
    let newName;
    let nameLength = name?.length;
    if (nameLength === 2) {
        newName = name.substring(0, 1) + '*';
    } else if (nameLength > 2) {
        // let star = '';
        // for (let i = 0; i < nameLength - 2; i++) {
        //     star += '*';
        // }
        newName = name.substring(0, 1) + '*' + name.substring(nameLength - 1, nameLength);
    } else {
        newName = name;
    }
    return newName;
}

/**
 * 当ws收到消息刷新页面
 * @param message 消息
 */
function reloadPage(message: string) {
    if (typeof (message) === 'string' && message === 'reloadPage') {
        location.reload();
    }
}

//ws地址
const WS_URL = process.env.NODE_ENV === "development" ? "ws://10.8.1.106:6480" : 'ws://172.26.101.215:6480';
export {
    formatName,
    reloadPage,
    WS_URL
}