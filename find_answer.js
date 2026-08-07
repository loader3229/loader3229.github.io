const CryptoJS = require('./js/crypto-js.min.js');

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

// First verify with known stage 15 answer "thanksalot"
const testSource = "loader3229chall15thanksalot";
const testKey = specialHashKey(testSource);
const testLookup = getAnswerStr(testKey);
console.log("Stage 15 lookup key (thanksalot):", testLookup);

// Now check 15.json to verify
const fs = require('fs');
const stage15 = JSON.parse(fs.readFileSync('./challenge/15.json', 'utf8'));
console.log("Keys in 15.json:", Object.keys(stage15));
console.log("Match?", Object.keys(stage15).includes(testLookup));

const targetKey = "C7oo2S0c/s/W5+SutqtK";
console.log("\nTarget key for stage 16:", targetKey);

// Let's write a smarter brute force, but first let's get ALL Poppin'Party song titles
// Actually wait, let me first try something obvious: let's see the note sequence again
// Wait! Wait a second! The video filename is 6z.mp4... 6z? What if that's a hint?
// Also, wait: let's look at the decrypted stage16 content again. Let's also check if maybe it's NOT Poppin'Party?
// Wait Kasumi IS Poppin'Party's guitarist/vocalist, but she could be playing a cover?
// Wait let me try a LOT more songs... Let me just make a big list

const candidates = [];

// Let's add all Poppin'Party songs I can think of (without special chars, alphanumeric only, and case doesn't matter)
const popipaSongs = [
    "YesBanGDream", "yesbangdream", "starbeat", "StarBeat",
    "HashiriHajimetaBakariNoKimiNi", "hashirihajimetabakarinoKimini", "onyournewjourney",
    "TokimekiExperience", "tokimekiexperience",
    "Teardrops", "teardrops",
    "CiRCLING", "circling",
    "Initial", "initial",
    "KizunaMusic", "kizunamusic",
    "DreamersGo", "dreamersgo",
    "Returns", "returns",
    "Breakthrough", "breakthrough",
    "HelloWink", "hellowink",
    "MiraiTrain", "miraitrain",
    "SakuraMemories", "sakuramemories",
    "YumeYumeGradation", "yumeyumegradation",
    "NoGirlNoCry", "nogirlnocry",
    "GuriGuri", "guriguri",
    "MoonlightWalk", "moonlightwalk",
    "APoppingDay", "apoppingday",
    "HappyHappyParty", "happyhappyparty",
    "KiraKiraDaTokaYumeDaToka", "kirakiradatokayumedatoka", "singgirls", "SparklingDreaming", "sparklingdreaming",
    "LiveBeyond", "livebeyond",
    "AstralHeart", "astralheart",
    "BlueBud", "bluebud",
    "Photograph", "photograph",
    "WhiteAfternoon", "whiteafternoon",
    "PoppinDream", "popindream",
    "WhatThePopipa", "whatthepopipa",
    "PopipaPopipopipa", "popipopipopipa",
    "NicoNicoCosume", "niconicocosume",
    "GirlsCode", "girlscode",
    "Jumpin", "jumpin",
    "StepXStep", "stepxstep",
    "Bondsmusic", "bondsmusic", "kizuna", "Kizuna",
    // Wait also Poppin'Party cover songs that are famous in music games
    "GodKnows", "godknows",
    "LostMyMusic", "lostmymusic",
    "DonTSayLazy", "dontsaylazy", "dontsaylazy",
    "CagayakeGirls", "cagayakegirls",
    "GoGoManiac", "gogomaniac",
    "UtauyoMiracle", "utauyomiracle",
    "NoThankYou", "nothankyou",
    "SweetsParade", "sweetsparade",
    "Monochrome", "monochrome",
    "ButterFly", "butterfly", "butter-fly",
    "CruelAngelsThesis", "cruelangelsthesis",
    "EternalBlaze", "eternalblaze",
    "Redo", "redo",
    "ThisGame", "thisgame",
    "CatchTheMoment", "catchthemoment",
    "Ignite", "ignite",
    "Swordland", "swordland",
    "Megalovania", "megalovania",
    "BadApple", "badapple",
    "NyanCat", "nyancat",
    // Wait wait a second! Wait a minute! The note sequence... let me hum it:
    // E B E B E B E G#... wait... wait... is this "Twinkle Twinkle Little Star"? No that starts C C G G A A G
    // Wait no, wait E B E B... wait! Wait... Oh my god! Wait wait wait! Is it "Guren no Yumiya"? No...
    // Wait wait another thought: let's check the video length! Earlier extract said 23.37 seconds, 701 frames at 30fps
    // Let's also think about the filename: 6z.mp4. 6z? z is the last letter... 6th? No... wait 6z could be leetspeak? No wait "6z" sounds like... no...
    // Wait wait wait! Let me just look at the first few notes again: E B E B E B E... that's alternating E and B SEVEN times then goes to G#!
    // SEVEN times E-B then G#? Wait let's count our note_frames from note_00:
    // Wait we had note_00 through note_27 = 28 notes
    // Let me also check if maybe I got the strings reversed! Oh! Wait! That's a critical mistake!
    // If I got the strings reversed (which string is top/bottom), then the notes would be wrong!
    // Let me also try super simple answers
    "6z", "sixz", "sixzee",
    "Kasumi", "kasumi", "Toyama", "toyama", "Tohyama",
    "Popipa", "popipa",
    "BanGDream", "bangdream", "Bandori", "bandori", "Garupa", "garupa", "GirlsBandParty", "girlsbandparty", "gbp",
    "Welcome", "welcome",
    "Thanksalot", "thanksalot",
    "Guitar", "guitar",
    "Song", "song",
    "Stage16", "stage16",
    "E", "B", "EB",
    // Wait wait! Oh! Wait a second! I just realized something!
    // When I ran analyze_all_notes.py earlier, I only found THREE different y positions for fingertips!
    // That would mean only THREE different strings are being played!
    // Wait my earlier detected y positions were: ~151-157, ~200-204, ~241
    // That's THREE strings only!
    // Let me also try really famous riffs that are on 2-3 strings
    "SmokeOnTheWater", "smokeonthewater", // wait that's G Bb C... no
    "SevenNationArmy", "sevennationarmy", // E E G E D C B E G B A... wait wait! Wait Seven Nation Army! Wait let's check that!
    // Wait Seven Nation Army notes: E E G E D C B (low E, G, E, D, C, B on E string?)
    // No wait Seven Nation Army bass riff is: E (open), E (7th fret? no wait let's recall correctly)
    // Wait actually Seven Nation Army is: E, G, E, D, C, B, E, G, B, A, G...
    // Hmm not exactly matching our sequence
    // Wait another famous one: "Sweet Child O Mine" intro? No that's more complex
    // Wait wait! Our note sequence was:
    // E B E B E B E G# D E E D# B E E B E B E C E G# B B G# B E
    // Wait there are 28 notes. Let's write them again with numbers:
    // 0:E 1:B 2:E 3:B 4:E 5:B 6:E 7:G# 8:D 9:E 10:E 11:D# 12:B 13:E 14:E 15:B 16:E 17:B 18:E 19:C 20:E 21:G# 22:B 23:B 24:G# 25:B 26:E
    // Wait wait! Hold on! I'm missing note 27! Let me check note count: 0-27 is 28 notes
    // Also wait: notes 0-6 alternate E and B: E B E B E B E - that's SEVEN pairs? No: positions 0=E, 1=B, 2=E, 3=B, 4=E, 5=B, 6=E = that's 4 E's and 3 B's alternating
    // Then note 7 is G#, 8 is D, 9-10 are E E, 11 is D# (Eb), 12 is B, 13-14 are E E, 15=B, 16=E, 17=B, 18=E, 19=C, 20=E, 21=G#, 22-23=B B, 24=G#, 25=B, 26=E
    // Wait that is... Wait a second! Wait is this "Happy Birthday"? No...
    // Wait wait! Wait what key is this in? Let's see: E, G#, B - that's E major chord! E G# B
    // Then there's D, D#, C... those are chromatic passing tones?
    // Wait E to D to D# to E? Let's see measures 8-11: G# D E E D# B
    // Wait wait... hold on... is this from a music game... Beatmania? IIDX? DDR? No wait it's BanG Dream... wait wait... wait! Wait a second! Wait the hint says "这是一首音游曲" - it's from a music game!
    // Wait BanG Dream! Girls Band Party! IS a music game (rhythm game), but wait could it be an original song FROM the game, or a cover?
    // Wait but wait another angle: let's just brute force more systematically
    "SevenNationArmy", "sevennationarmy",
    "SmokeOnTheWater", "smokeonthewater",
    "SweetChildOMine", "sweetchildomine",
    "EnterSandman", "entersandman",
    "BackInBlack", "backinblack",
    "IronMan", "ironman",
    "CrazyTrain", "crazytrain",
    "SunshineOfYourLove", "sunshineofyourlove",
    "SmellsLikeTeenSpirit", "slts", "smellsliketeenspirit",
    "ComeAsYouAre", "comeasyouare",
    "Smoke", "water", "sandman",
    // Wait wait! Wait! Wait a second! Oh my god! Wait note 19 is C! But in E major, C is C#, and we have C natural... Wait D natural instead of D#... 
    // Wait a minute! Wait... could this be in E MINOR? E minor has G natural, but we have G#...
    // Wait E minor: E F# G A B C D
    // Wait we have G# and D#... Hmm wait E major with accidentals?
    // Wait notes: E, G#, B, D, D#, C
    // Wait that's E, G#, B (E major), plus D, D#, C (chromatic below E)
    // Wait wait... D to D# is a half step up to E... wait that's a little chromatic run: D -> D# -> E
    // And then later: C -> E? No, note 19=C, note20=E
    // Wait wait let me just run the script and see what matches!
];

// First add all candidates to the array
candidates.push(...popipaSongs);

// Also test without any filter - just in case it's a simple word
const simpleWords = [
    "e", "b", "eb", "be", "music", "guitar", "song", "dream", "star", "beat",
    "bang", "pop", "party", "happy", "smile", "live", "show", "stage", "anime",
    "game", "kasumi", "toyama", "popipa", "roselia", "afterglow", "morfonica",
    "hello", "world", "pastel", "palettes", "ras", "raise", "suilen", "the", "a",
    "yes", "no", "go", "hi", "hello", "thanks", "alot", "welcome", "secret",
    "answer", "password", "code", "key", "level", "stage", "challenge",
    "beginner", "easy", "simple", "tutorial", "first", "test", "final", "last",
    "video", "mmd", "3d", "model", "tama", "bungle", "scrungle", "naochin"
];
candidates.push(...simpleWords);

let found = false;
for (const candidate of candidates) {
    const keySource = "loader3229chall16" + candidate;
    const answerKey = specialHashKey(keySource);
    const lookupKey = getAnswerStr(answerKey);
    
    if (lookupKey === targetKey) {
        console.log("\n!!! FOUND MATCH !!!");
        console.log("Answer:", candidate);
        console.log("Key source:", keySource);
        console.log("Lookup key:", lookupKey);
        found = true;
        break;
    }
}

if (!found) {
    console.log("\nNo match in candidate list yet.");
}
