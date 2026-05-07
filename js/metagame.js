var player = {
    metapoints: n(0),
    metaprestige: n(0),
    metatranscension: n(0),
    metareincarnation: n(0),
    metainf: n(0),
    metaupgrades: [n(0), n(0), n(0), n(0), n(0), n(0)],
    tick: Date.now(),
    lastprestige: Date.now(),
    lasttranscension: Date.now(),
    stat: 0,
};

function load_metagame() {
    var player_saved = JSON.parse(atob(localStorage.metagame));
    var fix = function (a) {
        a = n(a || 0);
        if (!a.eq(a)) a = n(0);
        return a;
    }
    var fix2 = function (a, b) {
        a = a || b;
        if (!isFinite(a)) a = b;
        return a;
    }
    player.metapoints = fix(player_saved.metapoints);
    player.metaupgrades[0] = fix(player_saved.metaupgrades[0]);
    player.metaupgrades[1] = fix(player_saved.metaupgrades[1]);
    player.metaupgrades[2] = fix(player_saved.metaupgrades[2]);
    player.metaupgrades[3] = fix(player_saved.metaupgrades[3]);
    player.metaupgrades[4] = fix(player_saved.metaupgrades[4]);
    player.metaupgrades[5] = fix(player_saved.metaupgrades[5]);
    player.metaprestige = fix(player_saved.metaprestige);
    player.metatranscension = fix(player_saved.metatranscension);
    player.metareincarnation = fix(player_saved.metareincarnation);
    player.metainf = fix(player_saved.metainf);
    player.tick = fix2(player_saved.tick, Date.now());
    player.lastprestige = fix2(player_saved.lastprestige, Date.now());
    player.lasttranscension = fix2(player_saved.lasttranscension, Date.now());
    player.stat = fix2(player_saved.stat, 0);
}
try {
    load_metagame();
} catch (e) { }

setInterval(function () {
    try {
        try {
            var player_saved = JSON.parse(atob(localStorage.metagame));
            if (player_saved.stat > player.stat) load_metagame();
        } catch (e) { }
        update_total_points();
        for (var q = 1; q <= 20; q++) {
            player.metapoints = metagain().mul(Date.now() - player.tick).div(20000).add(player.metapoints);
            if (player.metatranscension.gte(50)) {
                player.metaprestige = presgain().add(100).mul(Date.now() - player.tick).div(20000).mul(player.metatranscension.gte(1e4) ? (1 + ((total_points * player.metapoints.add(1).log10().div(1000).add(1).min(1.56).toNumber()) / 10000) ** 3) : 1).add(player.metaprestige);
            }
            player.metatranscension = metainfeffect2().mul(Date.now() - player.tick).div(20000).add(player.metatranscension);
            if (player.metaprestige.gte(50)) {
                for (var i = 1; i <= 5; i++) {
                    if (player.metapoints.gte(metacost(i))) {
                        player.metaupgrades[i] = player.metaupgrades[i].add(1);
                        player.stat = Date.now();
                    }
                }
            }
        }
        localStorage.metagame = btoa(JSON.stringify(player));
        if (document.location.href.indexOf("/metagame") != -1) {
            player.stat = Math.max(player.stat, 1);
            $("#metapoints").html(formatWhole(player.metapoints));
            $("#metagain").html(format(metagain()));
            $("#1level").html(formatWhole(player.metaupgrades[1]));
            $("#2level").html(formatWhole(player.metaupgrades[2]));
            $("#3level").html(formatWhole(player.metaupgrades[3]));
            $("#4level").html(formatWhole(player.metaupgrades[4]));
            $("#5level").html(formatWhole(player.metaupgrades[5]));
            $("#1effect").html(format(metaeffect(1)));
            $("#2effect").html(format(metaeffect(2)));
            $("#3effect").html(format(metaeffect(3)));
            $("#4effect").html(format(metaeffect(4)));
            $("#5effect").html(format(metaeffect(5)));
            $("#1cost").html(formatWhole(metacost(1)));
            $("#2cost").html(formatWhole(metacost(2)));
            $("#3cost").html(formatWhole(metacost(3)));
            $("#4cost").html(formatWhole(metacost(4)));
            $("#5cost").html(formatWhole(metacost(5)));
            $("#trans").css("display", (player.metatranscension.gt(0) || player.metaprestige.gte(1e9)) ? "" : "none");
            $("#prestige_milestone").css("display", (player.metaprestige.gt(0)) ? "" : "none");
            $("#trans_milestone").css("display", (player.metatranscension.gt(0)) ? "" : "none");
            $("#milestone0").css("display", (player.metapoints.gte(1e4) || player.metaupgrades[2].gte(1)) ? "" : "none");
            $("#upg2").css("display", (player.metapoints.gte(1e4) || player.metaupgrades[2].gte(1)) ? "" : "none");
            $("#milestone1").css("display", (player.metapoints.gte(1e6) || player.metaupgrades[3].gte(1)) ? "" : "none");
            $("#upg3").css("display", (player.metapoints.gte(1e6) || player.metaupgrades[3].gte(1)) ? "" : "none");
            $("#milestone2").css("display", (player.metapoints.gte(1e9) || player.metaprestige.gte(1) || player.metatranscension.gte(1)) ? "" : "none");
            $("#prestige").css("display", (player.metapoints.gte(1e9) || player.metaprestige.gte(1) || player.metatranscension.gte(1)) ? "" : "none");
            $("#milestone3").css("display", (player.metaprestige.gte(1)) ? "" : "none");
            $("#upg4").css("display", (player.metaprestige.gte(1)) ? "" : "none");
            $("#milestone4").css("display", (player.metaprestige.gte(50)) ? "" : "none");
            $("#milestone5").css("display", (player.metaprestige.gte(200)) ? "" : "none");
            $("#milestone6").css("display", (player.metaprestige.gte(1e4)) ? "" : "none");
            $("#milestone7").css("display", (player.metaprestige.gte(1e6)) ? "" : "none");
            $("#milestone8").css("display", (player.metaprestige.gte(1e9)) ? "" : "none");
            $("#milestone9").css("display", (player.metatranscension.gte(1)) ? "" : "none");
            $("#milestone10").css("display", (player.metatranscension.gte(50)) ? "" : "none");
            $("#milestone11").css("display", (player.metatranscension.gte(200)) ? "" : "none");
            $("#milestone12").css("display", (player.metatranscension.gte(1e4)) ? "" : "none");
            $("#milestone13").css("display", (player.metatranscension.gte(1e6)) ? "" : "none");
            $("#milestone14").css("display", (player.metapoints.gte(Number.MAX_VALUE)) ? "" : "none");
            $("#upg5").css("display", (player.metapoints.gte(Number.MAX_VALUE)) ? "" : "none");
            $("#presgain").html(formatWhole(presgain()));
            $("#metaprestige").html(formatWhole(player.metaprestige));
            $("#transgain").html(formatWhole(transgain()));
            $("#infgain").html(formatWhole(metainfgain()));
            $("#metatranscension").html(formatWhole(player.metatranscension));
            $("#preseffect").html(format(preseffect()));
            $("#transeffect").html(format(transeffect()));
            $("#metainf").html(formatWhole(player.metainf));
            $("#metainfeffect").html(format(metainfeffect()));
            $("#metainfeffect2").html(format(metainfeffect2()));
        }
        let mpps = presgain().mul(1000).div(Date.now() - player.lastprestige + 111);
        if (player.metaprestige.gte(200) && document.location.href.indexOf("/metagame") != -1) {
            $("#milestone2display").html(format(mpps));
        }
        if (player.metaprestige.gte(1e4) && document.location.href.indexOf("/metagame") != -1) {
            $("#milestone3display").html(format(player.metaprestige.max(1).log10().div(4).pow(2).max(1).min(100)));
        }
        if (player.metatranscension.gte(50) && document.location.href.indexOf("/metagame") != -1) {
            $("#milestone7display").html(format(presgain().add(100).mul(player.metatranscension.gte(1e4) ? (1 + ((total_points * player.metapoints.add(1).log10().div(1000).add(1).min(1.56).toNumber()) / 10000) ** 3) : 1)));
        }
        if (player.metatranscension.gte(200) && document.location.href.indexOf("/metagame") != -1) {
            $("#milestone8display").html(format(transgain().mul(1000).div(Date.now() - player.lasttranscension + 111)));
        }
        if (player.metatranscension.gte(1e4) && document.location.href.indexOf("/metagame") != -1) {
            $("#milestone9display").html(format(1 + ((total_points * player.metapoints.add(1).log10().div(1000).add(1).min(1.56).toNumber()) / 10000) ** 3));
        }
        if (document.location.href.indexOf("/incrementalgames") != -1) {
            if (player.stat >= 1) $("#metagamelink").html((localStorage.lang == 1 ? "元-游戏 -- 分数倍率：" : "Metagame -- Point Multiplier: ") + player.metapoints.add(1).log10().div(1000).add(1).min(1.56).mul(100).toNumber().toFixed(2) + "%");
            $("#total_points1").html(Math.floor(total_points * player.metapoints.add(1).log10().div(1000).add(1).min(1.56).toNumber()));
            $("#total_points2").html(Math.floor(total_points * player.metapoints.add(1).log10().div(1000).add(1).min(1.56).toNumber()));
        }
        if (document.location.href.indexOf("/b.html") != -1) {
            $("#result").html((sha512_256(localStorage.supporterCode + "loader3229").slice(2) == '71fcb6c48d87276cfcaf7db32358649f23c82461d543509061a0e783f04be5') ? ["<br>Supporter Code Valid!", "<br>捐赠码输入正确！"][localStorage.lang] : ["<br>Supporter Code Invalid or you did not input it!", "<br>捐赠码输入错误或者没有输入捐赠码！"][localStorage.lang]);
        }
        player.tick = Date.now();
    } catch (e) { console.log(e); }
}, 50);

function metagain() {
    if (player.stat == 0) return n(0);
    let ret = metaeffect(1).mul(metaeffect(2)).mul(metaeffect(3)).mul(metaeffect(4)).mul(metaeffect(5)).mul(preseffect()).mul(transeffect()).mul(metainfeffect());
    if (window.sha512_256 === undefined) return ret;
    if (sha512_256(localStorage.supporterCode + "loader3229").slice(2) == '71fcb6c48d87276cfcaf7db32358649f23c82461d543509061a0e783f04be5') ret = ret.mul(3);
    return ret;
}

function metaeffect(a) {
    if (a == 1) {
        let ret = Decimal.pow(Math.log10(Math.max(Math.min(total_points * player.metapoints.add(1).log10().div(1000).add(1).min(1.56).toNumber(), 30000) + 100, 100)) / 2, player.metaupgrades[1]);
        return ret;
    }
    if (a == 2) {
        let ret = Decimal.pow(Decimal.log10(player.metapoints.add(100)), player.metaupgrades[2].pow(0.75).div(2));
        return ret;
    }
    if (a == 3) {
        var intimacy = parseFloat(localStorage.kasumiIntimacy);
        if (!isFinite(intimacy)) intimacy = 0;
        if (intimacy < 0) intimacy = 0;
        if (intimacy > 1e12) intimacy = 1e12;
        localStorage.kasumiIntimacy = intimacy;
        let ret = Decimal.pow(Math.log10(intimacy + 10), player.metaupgrades[3].pow(0.75).div(4));
        return ret;
    }
    if (a == 4) {
        let ret = Decimal.pow(Math.log10(Date.now() - player.lastprestige + 1), player.metaupgrades[4].pow(0.8).div(player.metaprestige.gte(1e6) ? Math.max(5 - (Math.log10(Date.now() - player.lastprestige + 1) / 2) ** 1.5, player.metatranscension.gte(1e6) ? 1.5 : 2) : 5));
        return ret;
    }
    if (a == 5) {
        var opencount = parseFloat(localStorage.pageopencount);
        if (!isFinite(opencount)) opencount = 0;
        if (opencount < 0) opencount = 0;
        if (opencount > 1e12) opencount = 1e12;
        localStorage.pageopencount = opencount;
        let ret = Decimal.pow(opencount + 1, player.metaupgrades[5].pow(0.75));
        return ret;
    }
    return n(1);
}

function metacost(a) {
    if (a == 1) {
        let ret = Decimal.pow(1.5, player.metaupgrades[1].pow(1.15).add(6));
        return ret;
    }
    if (a == 2) {
        let ret = Decimal.pow(3, player.metaupgrades[2].add(5).pow(1.4));
        return ret;
    }
    if (a == 3) {
        let ret = Decimal.pow(10, player.metaupgrades[3].add(8)).mul(714);
        return ret;
    }
    if (a == 4) {
        let ret = Decimal.pow(5, player.metaupgrades[4].add(11).pow(1.4));
        return ret;
    }
    if (a == 5) {
        let ret = Decimal.pow(2, player.metaupgrades[5].add(32).pow(2));
        return ret;
    }
}

function metaupgrade(a) {
    var cost = metacost(a);
    if (player.metapoints.gte(cost)) {
        if (player.metaprestige.lt(50)) player.metapoints = player.metapoints.sub(cost);
        player.metaupgrades[a] = player.metaupgrades[a].add(1);
        player.stat = Date.now();
        localStorage.metagame = btoa(JSON.stringify(player));
    }
}

function presgain() {
    if (player.metainf.gte(1)) return Decimal.pow(10, player.metapoints.add(1).log10().sqrt().sub(3)).mul(transeffect()).mul(metainfeffect()).mul((sha512_256(localStorage.supporterCode + "loader3229").slice(2) == '71fcb6c48d87276cfcaf7db32358649f23c82461d543509061a0e783f04be5') ? 2 : 1);
    if (player.metatranscension.gte(1)) return Decimal.pow(10, player.metapoints.add(1).log10().sqrt().sub(3)).mul(transeffect()).mul((sha512_256(localStorage.supporterCode + "loader3229").slice(2) == '71fcb6c48d87276cfcaf7db32358649f23c82461d543509061a0e783f04be5') ? 2 : 1);
    if (player.metapoints.lt(1e9)) return n(0);
    return Decimal.pow(10, player.metapoints.add(1).log10().sqrt().sub(3)).mul((sha512_256(localStorage.supporterCode + "loader3229").slice(2) == '71fcb6c48d87276cfcaf7db32358649f23c82461d543509061a0e783f04be5') ? 2 : 1);
}

function preseffect() {
    if (player.metatranscension.gte(1)) return player.metaprestige.add(1);
    return player.metaprestige.add(1).sqrt();
}

function metaprestige() {
    player.metaprestige = player.metaprestige.add(presgain());
    player.metapoints = n(0);
    player.metaupgrades = [n(0), n(0), n(0), n(0), n(0), n(0)];
    player.stat = player.lastprestige = Date.now();
    localStorage.metagame = btoa(JSON.stringify(player));
}

function transgain() {
    if (player.metainf.gte(1)) return Decimal.pow(10, player.metaprestige.add(1).log10().sqrt().sub(3)).mul(metainfeffect()).mul((sha512_256(localStorage.supporterCode + "loader3229").slice(2) == '71fcb6c48d87276cfcaf7db32358649f23c82461d543509061a0e783f04be5') ? 1.5 : 1);
    if (player.metaprestige.lt(1e9)) return n(0);
    return Decimal.pow(10, player.metaprestige.add(1).log10().sqrt().sub(3)).mul((sha512_256(localStorage.supporterCode + "loader3229").slice(2) == '71fcb6c48d87276cfcaf7db32358649f23c82461d543509061a0e783f04be5') ? 1.5 : 1);
}

function transeffect() {
    return player.metatranscension.add(1);
}

function reingain() {
    if (player.metatranscension.lt(1e9)) return n(0);
    return Decimal.pow(10, player.metatranscension.add(1).log10().sqrt().sub(3)).mul((sha512_256(localStorage.supporterCode + "loader3229").slice(2) == '71fcb6c48d87276cfcaf7db32358649f23c82461d543509061a0e783f04be5') ? 1.5 : 1);
}

function reineffect() {
    return player.metareincarnation.add(1);
}

function metainfgain() {
    if (player.metareincarnation.gte(1)) return player.metapoints.add(1).log2().add(1).log2().div(2).pow(6).sub(player.metainf).div(25).sub(624).floor().max(0);
    return player.metapoints.add(1).log2().add(1).log2().div(5).pow(6).sub(player.metainf).div(8).sub(7).floor().max(0);
}

function metainfeffect() {
    return player.metainf.add(1);
}

function metainfeffect2() {
    return transgain().sqrt().mul((1 + ((total_points * player.metapoints.add(1).log10().div(1000).min(1.5).toNumber()) / 10000) ** 2)).add(player.metainf.sqrt()).mul(player.metainf.sqrt());
}

function metatranscension() {
    player.metatranscension = player.metatranscension.add(transgain());
    player.metaprestige = n(0);
    player.metapoints = n(0);
    player.metaupgrades = [n(0), n(0), n(0), n(0), n(0), n(0)];
    player.stat = player.lastprestige = player.lasttranscension = Date.now();
    localStorage.metagame = btoa(JSON.stringify(player));
}

function metainf() {
    if (metainfgain().lte(0)) return;
    player.metainf = player.metainf.add(metainfgain());
    player.metatranscension = n(0);
    player.metaprestige = n(0);
    player.metapoints = n(0);
    player.metaupgrades = [n(0), n(0), n(0), n(0), n(0), n(0)];
    player.stat = player.lastprestige = player.lasttranscension = Date.now();
    localStorage.metagame = btoa(JSON.stringify(player));
}
