/** Number Formatting */


function exponentialFormat(num, precision, mantissa = true) {
    let e = num.log10().floor()
    let m = num.div(Decimal.pow(10, e))
    if (m.toStringWithDecimalPlaces(precision) == 10) {
        m = decimalOne
        e = e.add(1)
    }
    e = (e.gte(1e9) ? format(e, 3) : (e.gte(10000) ? commaFormat(e, 0) : e.toStringWithDecimalPlaces(0)))
    if (mantissa)
        return m.toStringWithDecimalPlaces(precision) + "e" + e
    else return "e" + e
}

function commaFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    if (num.mag < 0.001) return (0).toFixed(precision)
    let init = num.toStringWithDecimalPlaces(precision)
    let portions = init.split(".")
    portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    if (portions.length == 1) return portions[0]
    return portions[0] + "." + portions[1]
}


function regularFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    if (num.mag < 0.0001) return (0).toFixed(precision)
    if (num.mag < 0.1 && precision !==0) precision = Math.max(precision, 4)
    return num.toStringWithDecimalPlaces(precision)
}

function fixValue(x, y = 0) {
    return x || new Decimal(y)
}

function sumValues(x) {
    x = Object.values(x)
    if (!x[0]) return decimalZero
    return x.reduce((a, b) => Decimal.add(a, b))
}

function format(decimal, precision = 2, small) {
    small = false
    decimal = new Decimal(decimal)
    if (isNaN(decimal.sign) || isNaN(decimal.layer) || isNaN(decimal.mag)) {
        player.hasNaN = true;
        return "NaN"
    }
    if (decimal.sign < 0) return "-" + format(decimal.neg(), precision, small)
    if (decimal.mag == Number.POSITIVE_INFINITY) return "Infinity"
    if (decimal.gte("eeee1000")) {
        var slog = decimal.slog()
        if (slog.gte(1e6)) return "F" + format(slog.floor())
        else return Decimal.pow(10, slog.sub(slog.floor())).toStringWithDecimalPlaces(3) + "F" + commaFormat(slog.floor(), 0)
    }
    else if (decimal.gte("1e1000000")) return exponentialFormat(decimal, 0, false)
    else if (decimal.gte("1e10000")) return exponentialFormat(decimal, 0)
    else if (decimal.gte(1e9)) return exponentialFormat(decimal, precision)
    else if (decimal.gte(1e3)) return commaFormat(decimal, 0)
    else if (decimal.gte(0.0001) || !small) return regularFormat(decimal, precision)
    else if (decimal.eq(0)) return (0).toFixed(precision)

    decimal = invertOOM(decimal)
    let val = ""
    if (decimal.lt("1e1000")){
        val = exponentialFormat(decimal, precision)
        return val.replace(/([^(?:e|F)]*)$/, '-$1')
    }
    else   
        return format(decimal, precision) + "⁻¹"

}

function formatWhole(decimal) {
    decimal = new Decimal(decimal)
    if (decimal.gte(1e9)) return format(decimal, 2)
    if (decimal.lte(0.99) && !decimal.eq(0)) return format(decimal, 2)
    return format(decimal, 0)
}

function formatTime(s) {
    if (s < 60) return format(s) + "s"
    else if (s < 3600) return formatWhole(Math.floor(s / 60)) + "m " + format(s % 60) + "s"
    else if (s < 86400) return formatWhole(Math.floor(s / 3600)) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
    else if (s < 31536000) return formatWhole(Math.floor(s / 86400) % 365) + "d " + formatWhole(Math.floor(s / 3600) % 24) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
    else return formatWhole(Math.floor(s / 31536000)) + "y " + formatWhole(Math.floor(s / 86400) % 365) + "d " + formatWhole(Math.floor(s / 3600) % 24) + "h " + formatWhole(Math.floor(s / 60) % 60) + "m " + format(s % 60) + "s"
}

function toPlaces(x, precision, maxAccepted) {
    x = new Decimal(x)
    let result = x.toStringWithDecimalPlaces(precision)
    if (new Decimal(result).gte(maxAccepted)) {
        result = new Decimal(maxAccepted - Math.pow(0.1, precision)).toStringWithDecimalPlaces(precision)
    }
    return result
}

// Will also display very small numbers
function formatSmall(x, precision=2) { 
    return format(x, precision, true)    
}

function invertOOM(x){
    let e = x.log10().ceil()
    let m = x.div(Decimal.pow(10, e))
    e = e.neg()
    x = new Decimal(10).pow(e).times(m)

    return x
}

/** Language Settings */

function change_language(a){
	localStorage.lang=a;
	document.location.reload();
}
if(localStorage.lang==1){
	$('html').attr('lang','zh-CN');
	$('#nav1').html('增量游戏表');
	$('#nav3').html('以前制作的游戏');
	//$('#nav2').html('BanG Dream! 自制谱');
	//$('#nav3').html('其他');
	//$('#nav4').html('捐赠');
	document.title=zhtitle;
	$('#lang-style').html('.en{display:none;}');
}else{
	$('html').attr('lang','en');
	$('#nav1').html('Incremental Games');
	$('#nav3').html('Game Prototypes');
	//$('#nav2').html('BanG Dream! GBP Fanmade Charts');
	//$('#nav3').html('Others');
	//$('#nav4').html('Donate Me');
	$('#lang-style').html('.zh{display:none;}');
}
$('#nav1').attr('href','/incrementalgames.html');
$('#nav3').attr('href','/gameprototypes.html');
$('#discord').attr('href','https://discord.gg/jztUReQ2vT');

/** Incremental Games */

var total_points=0;

try{
	var tmp=parseInt(JSON.parse(atob(localStorage.c2nv4in9eusojg59bmo)).m.points);
	if(Number.isFinite(tmp))total_points+=(tmp*7);else tmp=0;
	if(document.location.href.indexOf("/incrementalgames")!=-1){
		$("#milestone1").html(tmp);
		$("#milestone2").html(tmp);
	}
}catch(e){}

try{
	var tmp=0;
	for(var i=1;i<=7;i++){tmp+=parseInt(JSON.parse(atob(localStorage.multitree)).tm.buyables[i]);};
	if(Number.isFinite(tmp))total_points+=(tmp*10);else tmp=0;
	if(document.location.href.indexOf("/incrementalgames")!=-1){
		$("#multitree1").html(tmp);
		$("#multitree2").html(tmp);
	}
}catch(e){}

try{
	var tmp=0;
	JSON.parse(atob(atob(localStorage.zbkc).split(',')[12])).filter(function(a){a.filter(function(b){if(Number.isFinite(b))tmp+=b;})});
	if(Number.isFinite(tmp))total_points+=tmp;else tmp=0;
	if(document.location.href.indexOf("/incrementalgames")!=-1){
		$("#zbkc1").html(tmp);
		$("#zbkc2").html(tmp);
	}
}catch(e){}

try{
	var tmp=JSON.parse(LZString.decompressFromBase64(localStorage.trimpSave1)).global.highestRadonLevelCleared;
	if(Number.isFinite(tmp))total_points+=(tmp*3);else tmp=0;
	if(document.location.href.indexOf("/incrementalgames")!=-1){
		$("#trimps1").html(tmp);
		$("#trimps2").html(tmp);
	}
}catch(e){}

try{
	function calc_rank(a,b){
		a=EN(a);
		if(a.lte(1))return EN(0);
		let ret=a.slog().pow(2).mul(a.log10().div(a.log10().add(b)));
		if(ret.gte(16))ret=ret.mul(6.25).log10().div(2).slog().pow(2).mul(10).add(16);
		return ret.min(9999/7);
	}
	let game=JSON.parse(atob(localStorage.tower));
	let rank=EN(1);
	let tmp=rank.add(calc_rank(game.powerTotal,0).min(31.2)).add(calc_rank(game.pointsTotal,3).min(13.2)).add(calc_rank(game.lootTotal,6).min(10.5)).add(calc_rank(game.bricksTotal,9).min(7.3)).add(calc_rank(EN(game.manaTotal).add(1),0).min(5.6)).add(calc_rank(game.karmaTotal,12).min(5.7)).add(calc_rank(EN(game.elemiteTotal).add(1),0).min(4.5)).add((game.rift**0.5)*21).toNumber();
	if(Number.isFinite(tmp))total_points+=(tmp*10);else tmp=0;
	if(document.location.href.indexOf("/incrementalgames")!=-1){
		$("#towers1").html(Math.round(tmp*10)/10+"%");
		$("#towers2").html(Math.round(tmp*10)/10+"%");
	}
}catch(e){console.log(e);}

try{
	var tmp=new Decimal(JSON.parse(atob(localStorage.luck_incremental_save)).max_rarity).add(1).log10().toNumber();
	if(Number.isFinite(tmp)&&tmp>0)total_points+=(tmp*20);else tmp=0;
	if(document.location.href.indexOf("/incrementalgames")!=-1){
		$("#luck1").html(format(Decimal.pow(10,tmp).sub(1)));
		$("#luck2").html(format(Decimal.pow(10,tmp).sub(1)));
	}
}catch(e){}

try{
	var tmp=new Decimal(JSON.parse(atob(localStorage.ngm4rep)).saves[JSON.parse(atob(localStorage.ngm4rep)).current].totalmoney).add(1).log10().add(1).log10().toNumber();
	if(Number.isFinite(tmp)&&tmp>0)total_points+=(tmp*tmp*10);else tmp=0;
	if(document.location.href.indexOf("/incrementalgames")!=-1){
		$("#ngm4r1").html(format(Decimal.pow(10,Decimal.pow(10,tmp).sub(1)).sub(1)));
		$("#ngm4r2").html(format(Decimal.pow(10,Decimal.pow(10,tmp).sub(1)).sub(1)));
	}
}catch(e){}


try{
	if(document.location.href.indexOf("/incrementalgames")!=-1){
		$("#total_points1").html(Math.floor(total_points));
		$("#total_points2").html(Math.floor(total_points));
	}
}catch(e){}



/** Metagame */

var player={
	metapoints: new Decimal(0),
	metaprestige: new Decimal(0),
	metaupgrades: [new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0)],
	tick: Date.now(),
	stat: 0,
};

try{
	var player_saved=JSON.parse(atob(localStorage.metagame));
	player.metapoints=new Decimal(player_saved.metapoints);
	player.metaupgrades[1]=new Decimal(player_saved.metaupgrades[1]);
	player.metaupgrades[2]=new Decimal(player_saved.metaupgrades[2]);
	player.metaupgrades[3]=new Decimal(player_saved.metaupgrades[3]);
	player.metaprestige=new Decimal(player_saved.metaprestige);
	player.tick=(player_saved.tick || Date.now());
	player.stat=(player_saved.stat || 0);
}catch(e){}

setInterval(function(){
	try{
		try{
			var player_saved=JSON.parse(atob(localStorage.metagame));
			if(player_saved.stat>player.stat){
				player.metapoints=new Decimal(player_saved.metapoints);
				player.metaupgrades[1]=new Decimal(player_saved.metaupgrades[1]);
				player.metaupgrades[2]=new Decimal(player_saved.metaupgrades[2]);
				player.metaupgrades[3]=new Decimal(player_saved.metaupgrades[3]);
				player.metaprestige=new Decimal(player_saved.metaprestige);
				player.tick=(player_saved.tick || Date.now());
				player.stat=(player_saved.stat || 0);
			}
		}catch(e){}
		player.metapoints=metagain().mul(Date.now()-player.tick).div(1000).add(player.metapoints);
		localStorage.metagame=btoa(JSON.stringify(player));
		if(document.location.href.indexOf("/metagame")!=-1){
			player.stat = Math.max(player.stat,1);
			$("#metapoints").html(formatWhole(player.metapoints));
			$("#metagain").html(format(metagain()));
			$("#1level").html(formatWhole(player.metaupgrades[1]));
			$("#2level").html(formatWhole(player.metaupgrades[2]));
			$("#3level").html(formatWhole(player.metaupgrades[3]));
			$("#1effect").html(format(metaeffect(1)));
			$("#2effect").html(format(metaeffect(2)));
			$("#3effect").html(format(metaeffect(3)));
			$("#1cost").html(formatWhole(metacost(1)));
			$("#2cost").html(formatWhole(metacost(2)));
			$("#3cost").html(formatWhole(metacost(3)));
			$("#prestige").css("display",(player.metaprestige.gt(0)||player.metapoints.gte(1010903229))?"":"none");
			$("#presgain").html(formatWhole(presgain()));
			$("#metaprestige").html(formatWhole(player.metaprestige));
			$("#preseffect").html(format(preseffect()));
		}
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			$("#total_points1").html(Math.floor(total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(10).toNumber()));
			$("#total_points2").html(Math.floor(total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(10).toNumber()));
		}
		player.tick=Date.now();
	}catch(e){console.log(e);}
},100);

function metagain(){
	if(player.stat == 0)return new Decimal(0);
	let ret=metaeffect(1).mul(metaeffect(2)).mul(metaeffect(3)).mul(preseffect());
	if(window.sha512_256 === undefined)return ret;
	if(sha512_256(localStorage.supporterCode+"milestone").slice(1) == '91e43d5c20c41cc3b9da6da2a2aadc9ce35b27605ecb39c86a29bccbce145bf')ret = ret.mul(3);
	return ret;
}

function metaeffect(a){
	if(a==1){
		let ret=Decimal.pow(Math.log10(Math.max(Math.min(total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(10).toNumber(),20000)+100,1))/2,player.metaupgrades[1]);
		return ret;
	}
	if(a==2){
		let ret=Decimal.pow(Decimal.log10(player.metapoints.add(100)),player.metaupgrades[2].pow(0.75).div(2));
		return ret;
	}
	if(a==3){
		let ret=Decimal.pow(Math.log10(Math.min(parseFloat(localStorage.kasumiIntimacy),1e10)+10),player.metaupgrades[3].pow(0.75).div(4));
		return ret;
	}
}

function metacost(a){
	if(a==1){
		let ret=Decimal.pow(1.5,player.metaupgrades[1].pow(1.15).add(6));
		return ret;
	}
	if(a==2){
		let ret=Decimal.pow(3,player.metaupgrades[2].add(5).pow(1.4));
		return ret;
	}
	if(a==3){
		let ret=Decimal.pow(10,player.metaupgrades[3].add(8)).mul(714);
		return ret;
	}
}

function metaupgrade(a){
	var cost=metacost(a);
	if(player.metapoints.gte(cost)){
		player.metapoints=player.metapoints.sub(cost);
		player.metaupgrades[a]=player.metaupgrades[a].add(1);
		player.stat=Date.now();
		localStorage.metagame=btoa(JSON.stringify(player));
	}
}

function presgain(){
	if(player.metapoints.lt(1010903229))return new Decimal(0);
	return Decimal.pow(10,player.metapoints.add(1).log10().sqrt().sub(3));
}

function preseffect(){
	return player.metaprestige.add(1).sqrt();
}

function metaprestige(){
	player.metaprestige=player.metaprestige.add(presgain());
	player.metapoints=new Decimal(0);
	player.metaupgrades=[new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0)];
	player.stat=Date.now();
	localStorage.metagame=btoa(JSON.stringify(player));
}

/** Live2D Character */

l2d_force_change='';
localStorage.kasumiIntimacy=localStorage.kasumiIntimacy || '0';
function addIntimacy(a){
	localStorage.kasumiIntimacy=Math.min(parseFloat(localStorage.kasumiIntimacy)+a,1e10); 
}


if(localStorage.l2dv!='1'){
	localStorage.l2dv='1';
	localStorage.l2dmv='0';
	localStorage.l2dm=localStorage.l2dm || '/l2d_models/kasumievent130.json';
}

var live2d_messages={
	chat: ['Do you want to know the other side of me?','想要了解不一样的我吗？'],
	chat_message: [
		[
			'<a href="https://www.bilibili.com/video/BV1hv4y1i7EM" target="_blank" onclick="addIntimacy(10)">Take a look at my dance: Star Night Snow!</a>',
			'<a href="https://www.bilibili.com/video/BV1hv4y1i7EM" target="_blank" onclick="addIntimacy(10)">Take a look at my dance: Star Night Snow!</a>',
			'<a href="https://www.bilibili.com/video/BV1hv4y1i7EM" target="_blank" onclick="addIntimacy(10)">Take a look at my dance: Star Night Snow!</a>',
			'I just All-Perfected SPECIAL Difficulty Chart of "HELL! or HELL?" in GBP!',
			'I just All-Perfected SPECIAL Difficulty Chart of "SENSENFUKOKU" in GBP!',
			'I just All-Perfected Super-Hard SPECIAL Difficulty Chart of "HELL! or HELL?" in GBP!',
			'I just All-Perfected Super-Hard SPECIAL Difficulty Chart of "SENSENFUKOKU" in GBP!',
			'I just All-Perfected one of loader3229\'s BanG Dream! GBP Fanmade Chart: <a href="https://bestdori.com/community/charts/73910" onclick="addIntimacy(2)">qualia -ideaesthesia- [ANOTHER 35]</a>!',
			'Did you know? I can play any kind of guitars including my Random Star!',
			'Twinkle, Twinkle, Little, Star~',
			'Did you know? There can be at least 10 myselves at the same time in loader3229\'s MikuMikuDance 9.31.',
		],
		[
			//'你知道吗？我会跳舞！<a href="https://www.bilibili.com/video/BV14S4y177bd" target="_blank" onclick="addIntimacy(10)">看一下我跳的《千本桜》吧！</a>',
			//'你知道吗？我会跳舞！<a href="https://www.bilibili.com/video/BV14S4y177bd" target="_blank" onclick="addIntimacy(10)">看一下我跳的《千本桜》吧！</a>',
			'你知道吗？我会跳舞！<a href="https://www.bilibili.com/video/BV1hv4y1i7EM" target="_blank" onclick="addIntimacy(10)">看一下我跳的《スターナイトスノー》吧！</a>',
			'你知道吗？我会跳舞！<a href="https://www.bilibili.com/video/BV1hv4y1i7EM" target="_blank" onclick="addIntimacy(10)">看一下我跳的《スターナイトスノー》吧！</a>',
			'你知道吗？我会跳舞！<a href="https://www.bilibili.com/video/BV1hv4y1i7EM" target="_blank" onclick="addIntimacy(10)">看一下我跳的《スターナイトスノー》吧！</a>',
			'你知道吗？我已经打出了《HELL! or HELL?》Special难度的ALL PERFECT！',
			'你知道吗？我已经打出了《HELL! or HELL?》超难Special难度（33级官谱）的ALL PERFECT！',
			'你知道吗？我已经打出了《SENSENFUKOKU》Special难度的ALL PERFECT！',
			'你知道吗？我已经打出了《SENSENFUKOKU》超难Special难度（33级官谱）的ALL PERFECT！',
			'你知道吗？我已经打出了loader3229的<a href="https://bestdori.com/community/charts/73910" onclick="addIntimacy(2)">qualia -ideaesthesia- [ANOTHER 35]</a>（Bestdori ID 73910）的ALL PERFECT！',
			'你知道吗？我的手指每秒可以点击屏幕15次，而loader3229的手指每秒可以点击屏幕9.6次。',
			'你知道吗？我会弹任何型号的吉他，包括RANDOM STAR。',
			'你知道吗？Kirakira就是Kirakira，而Dokidoki就是Dokidoki！',
			'你知道吗？在我陪着loader3229的时候，我想到了很多的歌词！',
			//'你知道吗？我知道，你已经点了'+chat_times+'次这个按钮。（本计数在刷新或离开页面后重置）',
			'你知道吗？我有许多不同的形象，包括Live2D版形象，MV版形象，卡面版形象等等。',
			'你知道吗？现在我和我的新版本有各自的3D模型。（我觉得…我的新版本3D模型…好像有点不好看？）',
			'你知道吗？在loader3229的MikuMikuDance 9.31里面，可以同时存在至少10个我。',
		]
	],
	motion: ['Do you want to activate my Live2D motion?','想让我做Live2D动作吗？'],
	info: ['Do you want to know my information?','想看关于我的信息吗？'],
	fix: ['Do you want to fix my Live2D display problem?','想修复我的Live2D模型显示问题吗？'],
};

function initl2d(){
	$("#live2d").attr("width",600);
	$("#live2d").attr("height",750);
	$("#live2d").css("width",'300px');
	$("#live2d").css("height",'375px');
	$(".waifu").css("right",'0px');
	$('.waifu-tool').show();
	$(".waifu-tips").width('250px');
	$(".waifu-tips").height('120px');
	$(".waifu-tips").css("top",'-15px');
	$(".waifu-tips").css("font-size",'15px');
	$(".waifu-tool").css("font-size",'16px');
	$(".waifu-tool span").css("line-height",'20px');
	$('.waifu-tool .fui-chat').hover(function (){
		showMessage(live2d_messages.chat[localStorage.lang],3000);
	});
	var chat_times=0;
	$('.waifu-tool .fui-chat').click(function (){
		addIntimacy(1);
		chat_times++;
		showMessage(live2d_messages.chat_message[localStorage.lang],5000,true);
	});
	$('.waifu-tool .fui-star').hover(function (){
		showMessage(live2d_messages.motion[localStorage.lang],3000);
	});
	$('.waifu-tool .fui-star').click(function (){
		addIntimacy(2);
		let id=Math.floor(Math.random()*5+1);
		if(id==1)window.l2de.startMotion('c7',0);
		if(id==2)window.l2de.startMotion('c',0);
		if(id==3)window.l2de.startMotion('c4',0);
		if(id==4)window.l2de.startMotion('c2',0);
		if(id==5)window.l2de.startMotion('c3',0);
		window.l2da.src="/l2d_models/systemProfile_001_"+id+".mp3";
		window.l2da.currentTime=0;
		window.l2da.play();
		currentevent="systemProfile_001_"+id;
	});/*
	$('.waifu-tool .fui-image').hover(function (){
		showMessage('想看一下loader3229给我拍的照片吗？',3000);
	});
	$('.waifu-tool .fui-image').click(function (){
		if(l2d_force_change!='0'&&l2d_force_change!='')return alert('该版本暂不支持此操作');
		if(l2d_force_change!='0'&&localStorage.l2dmv!='0')return alert('该版本暂不支持此操作');
		window.open('/ksm/MMDPicM/MMDPicM'+Math.floor(Math.random()*2)+'.png');
	});
	$('.waifu-tool .fui-folder').hover(function (){
		showMessage('想看一下我的档案吗？',3000);
	});
	$('.waifu-tool .fui-folder').click(function (){
		document.location.href='/ksm/'+(l2d_force_change=='0'?'':l2d_force_change=='1'?'index-v7.html':localStorage.l2dmv=='0'?'':'index-v7.html');
	});
	$('.waifu-tool .fui-gear').hover(function (){
		showMessage('想切换我的Live2D服装吗？',3000);
	});
	$('.waifu-tool .fui-gear').click(function (){
		if(l2d_force_change=='1')loadlive2d('live2d', window.l2d_current_model=localStorage.l2dmn=[
		'/newkasumicasual.json',
		'/newkasumischoolwinter.json',
		'/newkasumilivedefault.json'
		][Math.floor(Math.random()*3)], null);
		else if(localStorage.l2dmv=='0'||l2d_force_change=='0')loadlive2d('live2d', window.l2d_current_model=localStorage.l2dm=[
		'/kasumi.json',
		'/kasumik.json',
		'/kasumievent130.json',
		'/kasumievent168.json',
		'/kasumi2star1.json',
		'/kasumi2star2.json',
		'/kasumi2star4.json',
		'/kasumicasual.json',
		'/kasumischoolwinter.json'
		][Math.floor(Math.random()*9)], null);
		else loadlive2d('live2d', window.l2d_current_model=localStorage.l2dmn=[
		'/newkasumicasual.json',
		'/newkasumischoolwinter.json',
		'/newkasumilivedefault.json'
		][Math.floor(Math.random()*3)], null);
		window.l2da.currentTime=0;
		window.l2da.pause();
	});*/
	$('.waifu-tool .fui-info-circle').hover(function (){
		showMessage(live2d_messages.info[localStorage.lang],3000);
	});
	$('.waifu-tool .fui-info-circle').click(function (){
		addIntimacy(4);
		if(localStorage.lang==0){
			window.open('https://bandori.fandom.com/wiki/Toyama_Kasumi');
			return;
		}
		if(window.confirm("点“确定”进入看板娘的萌娘百科页面，“取消”进入如何添加看板娘页面"))window.open('https://zh.moegirl.org.cn/zh-cn/户山香澄');
		else window.open('https://www.fghrsh.net/post/123.html');
	});
	$('.waifu-tool .fui-cmd').hover(function (){
		showMessage(live2d_messages.fix[localStorage.lang],3000);
	});
	$('.waifu-tool .fui-cmd').click(function (){
		loadlive2d('live2d', window.l2d_current_model, null);
		window.l2da.currentTime=0;
		window.l2da.pause();
	});
	window.l2d_current_model=(l2d_force_change=='1')?localStorage.l2dmn:(localStorage.l2dmv=='0'||l2d_force_change=='0')?localStorage.l2dm:localStorage.l2dmn;
	loadlive2d('live2d', window.l2d_current_model, null);
	if(localStorage.lang==0)showMessage('Sparkling, Heart-Pounding, I\'m Kasumi from Poppin\'Party! Also, because of loader3229, I have extra abilities now!',3000,true);
	else showMessage('我是闪闪发光、心动不已的户山香澄！而且，因为loader3229，我和其他的户山香澄不一样！（点击我右边最下面的<span class="fui-cmd"></span>按钮或上面“Live2D模型显示不正常修复”修复我的Live2D模型显示问题）',3000,true);
}


function setl2dm(a){
	if(localStorage.l2dmv!='0'&&l2d_force_change!='0'){
		localStorage.l2dm=a;return;
	}
	loadlive2d('live2d', window.l2d_current_model=localStorage.l2dm=a, null);
	window.l2da.currentTime=0;
	window.l2da.pause();
}/*
function setl2dmn(a){
	if(localStorage.l2dmv!='1'&&l2d_force_change!='1'){
		localStorage.l2dmn=a;return;
	}
	loadlive2d('live2d', window.l2d_current_model=localStorage.l2dmn=a, null);
	window.l2da.currentTime=0;
	window.l2da.pause();
}
function setl2dv(a){ 
	$('.waifu-tips').stop().css('opacity',0);
	sessionStorage.removeItem('waifu-text')
	localStorage.l2dmv=a;
	loadlive2d('live2d', window.l2d_current_model=((l2d_force_change=='1')?localStorage.l2dmn:(localStorage.l2dmv=='0'||l2d_force_change=='0')?localStorage.l2dm:localStorage.l2dmn), null);
	window.l2da.currentTime=0;
	window.l2da.pause();
}*/
setTimeout(initl2d,500);
//window.l2de.startMotion('c',0);


function showMessage(text, timeout, flag) {
    if(flag || sessionStorage.getItem('waifu-text') === '' || sessionStorage.getItem('waifu-text') === null){
        if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
        console.log('[Message]', text.replace(/<[^<>]+>/g,''));
        
        if(flag) sessionStorage.setItem('waifu-text', text);
        
        $('.waifu-tips').stop();
        $('.waifu-tips').html(text).fadeTo(200, 1);
        if (timeout === undefined) timeout = 5000;
        hideMessage(timeout);
    }
}

function hideMessage(timeout) {
    $('.waifu-tips').stop().css('opacity',1);
    if (timeout === undefined) timeout = 5000;
    window.setTimeout(function() {sessionStorage.removeItem('waifu-text')}, timeout);
    $('.waifu-tips').delay(timeout).fadeTo(200, 0);
}

window.l2da=new Audio();
window.l2da.src="/l2d_models/systemProfile_001_1.mp3";
window.timeout0=0;
currentevent="systemProfile_001_1";
function syncupdate(){
	if(window.l2de&&window.l2de.setLipSync&&window.l2d_current_model!=((l2d_force_change=='1')?localStorage.l2dmn:(localStorage.l2dmv=='0'||l2d_force_change=='0')?localStorage.l2dm:localStorage.l2dmn)){
		window.l2d_current_model=((l2d_force_change=='1')?localStorage.l2dmn:(localStorage.l2dmv=='0'||l2d_force_change=='0')?localStorage.l2dm:localStorage.l2dmn);
		loadlive2d('live2d', window.l2d_current_model, null);
		window.l2da.currentTime=0;
		window.l2da.pause();
	}
	if(window.l2de&&window.l2de.setLipSync)window.l2de.setLipSync(null);
	var arr=lipSyncValues[currentevent];
	if(arr){
		var index=Math.floor(window.l2da.currentTime*20+2.5);
		if(arr[index] && window.l2da.paused!=true)window.l2de&&window.l2de.setLipSyncValue(arr[index]);
		else window.l2de&&window.l2de.setLipSyncValue(0);
	}else window.l2de&&window.l2de.setLipSyncValue(0);
}
setInterval(syncupdate,50);

lipSyncValues={};

function getLSV(a,b){
var xhr=new XMLHttpRequest();
xhr.onreadystatechange=(function(xhr,a){
if(xhr.readyState==4 && xhr.status == 200){
var resp=xhr.responseText.split("\n");
var result=[];
for(var i=1;i<resp.length;i++){
if(result[Math.floor(i/50)]===undefined)result[Math.floor(i/50)]=0;
var temp=parseFloat(resp[i]);
if(temp!=temp)temp=0;
result[Math.floor(i/50)]+=(temp/b);
}
result.push(0);
lipSyncValues[a]=result;
}
}).bind(null,xhr,a);
xhr.open("GET","/l2d_models/"+a+".txt",true);
xhr.send();
}
getLSV("systemProfile_001_1",11);
getLSV("systemProfile_001_2",11);
getLSV("systemProfile_001_3",11);
getLSV("systemProfile_001_4",11);
getLSV("systemProfile_001_5",11);