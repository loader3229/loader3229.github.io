const CryptoJS = require('./js/crypto-js.min.js');
const fs = require('fs');

function specialHash(str) {
    const filtered = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (filtered.length === 0) return 0n;
    const MOD = (1n << 128n) - 159n;
    let hash = 0n;
    for (const ch of filtered) {
        let val;
        if (ch >= '0' && ch <= '9') {
            val = BigInt(ch.charCodeAt(0) - '0'.charCodeAt(0));
        } else {
            val = BigInt(ch.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
        }
        hash = (hash * 36n + val) % MOD;
    }
    return hash;
}

function specialHashHex(str) {
    const hash = specialHash(str);
    return hash.toString(16).padStart(32, '0');
}

function specialHashKey(str) {
    const hash = specialHashHex(str);
    return CryptoJS.enc.Hex.parse(hash);
}

function getAnswerStr(key) {
    return CryptoJS.AES.encrypt("AnswerIsCorrect!", key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding}).toString().slice(0,20);
}

function decryptStr(key, str) {
    return CryptoJS.AES.decrypt(str, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8);
}

// 第15关答案是thanksalot，用于解密第16关题面
const stage = 15;
const answer = "thanksalot";
const keySource = "loader3229chall" + stage + answer;
console.log("Key source:", keySource);

const answerKey = specialHashKey(keySource);
console.log("Key (hex):", specialHashHex(keySource));

const lookupKey = getAnswerStr(answerKey);
console.log("Lookup key:", lookupKey);

// 读取15.json
const data = JSON.parse(fs.readFileSync('./challenge/15.json', 'utf8'));
console.log("\nAvailable keys in 15.json:", Object.keys(data));

const encryptedContent = data[lookupKey];
if (encryptedContent) {
    console.log("\nFound encrypted content!");
    const stage16Content = decryptStr(answerKey, encryptedContent);
    console.log("\n========== 第16关题面 ==========");
    console.log(stage16Content);
    console.log("==================================");
    fs.writeFileSync('./stage16_content.html', stage16Content);
    console.log("\n题面已保存到 stage16_content.html");
} else {
    console.log("Key not found! Trying alternative...");
    // 如果找不到，尝试直接解密所有值
    for (const [k, v] of Object.entries(data)) {
        try {
            const decrypted = decryptStr(answerKey, v);
            if (decrypted && decrypted.length > 0) {
                console.log("Decrypted with key", k, ":", decrypted.substring(0, 100));
            }
        } catch(e) {}
    }
}
