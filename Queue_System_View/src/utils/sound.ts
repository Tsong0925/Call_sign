//h5语音api
const synth = window.speechSynthesis;
const msg = new window.SpeechSynthesisUtterance();

let languageType;

export function findLanguageType() {
    let voices = speechSynthesis.getVoices();
    if (voices.length) {
        let zhCnLangs = speechSynthesis.getVoices().filter((x) => x.localService && x.lang == "zh-CN");
        languageType = zhCnLangs.find((x) => x.name == "Microsoft Simmplified Chinese");
        msg.voice = languageType as any;
        msg.lang = "zh-CN"; // 使用的语言，例如 zh-CN
    }
}

export function playSound(text: string) {
    synth.cancel();
    msg.volume = 10; // 声音音量：1
    msg.rate = 1; // 语速：1,从0.1-10，默认为1，2表示正常语速的两倍
    msg.pitch = 1; // 音高：1
    msg.text = text;
    msg.volume = 5;
    synth.speak(msg);
}

