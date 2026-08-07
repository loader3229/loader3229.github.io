
// 解密第16关完整内容 - 使用CryptoJS，正确实现specialHash
const fs = require('fs');
const CryptoJS = require('crypto-js');

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
    return CryptoJS.AES.encrypt("AnswerIsCorrect!", key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding}).toString().slice(0, 20);
}

function decryptStr(key, str) {
    return CryptoJS.AES.decrypt(str, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8);
}

// 读取第15关答案
const stage = 15;
const answer = "thanksalot";
const keySource = "loader3229chall" + stage + answer;
console.log("Key source:", keySource);

const answerKey = specialHashKey(keySource);
console.log("Key (hex):", answerKey.toString(CryptoJS.enc.Hex));

// 读取15.json（包含第16关的加密内容）
const stage16Data = JSON.parse(fs.readFileSync('/workspace/challenge/15.json', 'utf8'));
const lookupKey = getAnswerStr(answerKey);
console.log("Lookup key:", lookupKey);
console.log("Expected key in 15.json:", Object.keys(stage16Data)[0]);

const encryptedContent = stage16Data[lookupKey];
if (!encryptedContent) {
    console.log("ERROR: Key mismatch!");
    process.exit(1);
}

console.log("Encrypted content found, length:", encryptedContent.length);

const decrypted = decryptStr(answerKey, encryptedContent);
console.log("\n=== Decrypted Stage 16 Content ===");
console.log(decrypted);
fs.writeFileSync('/workspace/stage16_decrypted.html', decrypted);
console.log("\nSaved to /workspace/stage16_decrypted.html");
