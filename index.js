var decimalZero=new Decimal(0);
var decimalOne=new Decimal(1);

var b=parseFloat(localStorage.pageopencount)+1;
if(!isFinite(b) || b<=0)localStorage.pageopencount=1;
else localStorage.pageopencount=b;

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
    else if (decimal.gte("1e10000000")) return exponentialFormat(decimal, 0, false)
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

entitle=document.title;

function change_language(a){
	localStorage.lang=a;
	if(localStorage.lang==1){
		$('html').attr('lang','zh-CN');
		$('#nav1').html('增量游戏表');
		$('#nav3').html('以前制作的游戏');
		//$('#nav2').html('BanG Dream! 自制谱');
		//$('#nav3').html('其他');
		$('#nav4').html('捐赠');
		document.title=zhtitle;
		$('#lang-style').html('.en{display:none;}');
	}else{
		$('html').attr('lang','en');
		$('#nav1').html('Incremental Games');
		$('#nav3').html('Game Prototypes');
		//$('#nav2').html('BanG Dream! GBP Fanmade Charts');
		//$('#nav3').html('Others');
		$('#nav4').html('Donate Me');
		document.title=entitle;
		$('#lang-style').html('.zh{display:none;}');
	}
}

if(localStorage.lang === undefined){
	localStorage.lang=0;
	if((navigator.language || "").toString().indexOf("zh")!=-1)localStorage.lang=1;
}
change_language(localStorage.lang);
$('#nav1').attr('href','/incrementalgames.html');
$('#nav3').attr('href','/gameprototypes.html');
$('#nav4').attr('href','/b.html');
$('#discord').attr('href','https://discord.gg/jztUReQ2vT');

/** Incremental Games */

var total_points=0;

function update_total_points(){
	
	total_points=0;
	
	try{
		var tmp=new Decimal(JSON.parse(atob(localStorage.FileLoaderSave)).totalData).add(1).log2().toNumber();
		if(Number.isFinite(tmp))total_points+=Math.min(tmp,1024);else tmp=0;
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			$("#ifl1").html(format(Decimal.pow(2,tmp).sub(1)));
			$("#ifl2").html(Math.floor(Math.min(tmp,1024)));
		}
	}catch(e){}

	try{
		var tmp=parseInt(JSON.parse(atob(localStorage.c2nv4in9eusojg59bmo)).m.points);
		if(Number.isFinite(tmp))total_points+=(tmp*6);else tmp=0;
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			$("#milestone1").html(tmp);
			$("#milestone2").html(tmp*6);
		}
	}catch(e){}

	try{
		var tmp=0;
		for(var i=1;i<=8;i++){tmp+=parseInt(JSON.parse(atob(localStorage.multitree)).tm.buyables[i]);};
		if(Number.isFinite(tmp))total_points+=(tmp*9);else tmp=0;
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			$("#multitree1").html(tmp);
			$("#multitree2").html(tmp*9);
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
		if(Number.isFinite(tmp))total_points+=Math.min(tmp*3,1500);else tmp=0;
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			$("#trimps1").html(tmp);
			$("#trimps2").html(Math.floor(Math.min(tmp*3,1500)));
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
		if(Number.isFinite(tmp))total_points+=Math.min(tmp*10,1000);else tmp=0;
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			$("#towers1").html(Math.round(tmp*10)/10+"%");
			$("#towers2").html(Math.round(tmp*10));
		}
	}catch(e){console.log(e);}

	try{
		var tmp=new Decimal(JSON.parse(atob(localStorage.luck_incremental_save)).max_rarity).add(1).log10().toNumber();
		if(Number.isFinite(tmp)&&tmp>0)total_points+=Math.min(tmp*20,1000);else tmp=0;
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			$("#luck1").html(format(Decimal.pow(10,tmp).sub(1)));
			$("#luck2").html(Math.floor(Math.min(tmp*20,1000)));
		}
	}catch(e){}

	try{
		var tmp=new Decimal(JSON.parse(atob(localStorage.ngm4rep)).saves[JSON.parse(atob(localStorage.ngm4rep)).current].totalmoney).add(1).log10().add(1).log10().toNumber();
		if(Number.isFinite(tmp)&&tmp>0)total_points+=(tmp*tmp*10);else tmp=0;
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			$("#ngm4r1").html(format(Decimal.pow(10,Decimal.pow(10,tmp).sub(1)).sub(1)));
			$("#ngm4r2").html(Math.floor(tmp*tmp*10));
		}
	}catch(e){}

	try{
		var tmp=new Decimal(JSON.parse(atob(localStorage.testSave)).mass).add(1e10).log10().log10().log10().toNumber();
		if(Number.isFinite(tmp)&&tmp>0)total_points+=Math.min(Math.sqrt(tmp)*100,1000);else tmp=0;
		if(localStorage.imr_secret_badge1=="1")total_points+=200;
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			$("#imr1").html(format(Decimal.pow(10,Decimal.pow(10,Decimal.pow(10,tmp))).sub(1e10)));
			$("#imr2").html(Math.floor(Math.min(Math.sqrt(tmp)*100,1000)));
			if(localStorage.imr_secret_badge1=="1")$("#imr2").html(Math.floor(Math.min(Math.sqrt(tmp)*100,1000))+200);
			if(localStorage.imr_secret_badge1=="1")$("#imr3").html(1200);
		}
	}catch(e){}


	try{
		var m=JSON.parse(decodeURIComponent(atob(localStorage.ibsim))).money;var tmp=0;
		if(m.sign==1){
			if(m.array[0]<0)m.array[0]=0;
			if(m.array[2]>0){
				tmp=1e10;
			}else if(m.array[1]>=3){
				tmp=1e10;
			}else if(m.array[1]==2){
				tmp=m.array[0];
			}else if(m.array[1]==1){
				tmp=Math.log10(m.array[0]+1);
			}else if(m.array[1]==0 || m.array[1] === undefined){
				tmp=Math.log10(Math.log10(m.array[0]+1)+1);
			}
		}
		if(tmp>1e10)tmp=1e10;
		if(Number.isFinite(tmp)&&tmp>0)total_points+=Math.min(tmp*Math.sqrt(1000),1000);else tmp=0;
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			$("#ibsim1").html(format(Decimal.pow(10,Decimal.pow(10,tmp).sub(1)).sub(1)));
			$("#ibsim2").html(Math.floor(Math.min(tmp*Math.sqrt(1000),1000)));
		}
	}catch(e){}

}

update_total_points();

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
	metatranscension: new Decimal(0),
	metainf: new Decimal(0),
	metaupgrades: [new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0)],
	tick: Date.now(),
	lastprestige: Date.now(),
	lasttranscension: Date.now(),
	stat: 0,
};

try{
	var player_saved=JSON.parse(atob(localStorage.metagame));
	player.metapoints=new Decimal(player_saved.metapoints || 0);
	player.metaupgrades[1]=new Decimal(player_saved.metaupgrades[1] || 0);
	player.metaupgrades[2]=new Decimal(player_saved.metaupgrades[2] || 0);
	player.metaupgrades[3]=new Decimal(player_saved.metaupgrades[3] || 0);
	player.metaupgrades[4]=new Decimal(player_saved.metaupgrades[4] || 0);
	player.metaprestige=new Decimal(player_saved.metaprestige || 0);
	player.metatranscension=new Decimal(player_saved.metatranscension || 0);
	player.metainf=new Decimal(player_saved.metainf || 0);
	player.tick=(player_saved.tick || Date.now());
	player.lastprestige=(player_saved.lastprestige || Date.now());
	player.lasttranscension=(player_saved.lasttranscension || Date.now());
	player.stat=(player_saved.stat || 0);
}catch(e){}

setInterval(function(){
	try{
		try{
			var player_saved=JSON.parse(atob(localStorage.metagame));
			if(player_saved.stat>player.stat){
				player.metapoints=new Decimal(player_saved.metapoints || 0);
				player.metaupgrades[1]=new Decimal(player_saved.metaupgrades[1] || 0);
				player.metaupgrades[2]=new Decimal(player_saved.metaupgrades[2] || 0);
				player.metaupgrades[3]=new Decimal(player_saved.metaupgrades[3] || 0);
				player.metaupgrades[4]=new Decimal(player_saved.metaupgrades[4] || 0);
				player.metaprestige=new Decimal(player_saved.metaprestige || 0);
				player.metatranscension=new Decimal(player_saved.metatranscension || 0);
				player.tick=(player_saved.tick || Date.now());
				player.lastprestige=(player_saved.lastprestige || Date.now());
				player.lasttranscension=(player_saved.lasttranscension || Date.now());
				player.stat=(player_saved.stat || 0);
			}
		}catch(e){}
		update_total_points();
		for(var q=1;q<=20;q++){
			player.metapoints=metagain().mul(Date.now()-player.tick).div(20000).add(player.metapoints);
			if(player.metatranscension.gte(50)){
				player.metaprestige=presgain().add(100).mul(Date.now()-player.tick).div(20000).mul(player.metatranscension.gte(1e4)?(1+((total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(30).toNumber()+player.metatranscension.add(1).log10().mul(100).toNumber())/10000)**3):1).add(player.metaprestige);
			}
			player.metatranscension=metainfeffect2().mul(Date.now()-player.tick).div(20000).add(player.metatranscension);
			if(player.metaprestige.gte(50)){
				for(var i=1;i<=4;i++){
					if(player.metapoints.gte(metacost(i))){
						player.metaupgrades[i]=player.metaupgrades[i].add(1);
						player.stat=Date.now();
					}
				}
			}
		}
		localStorage.metagame=btoa(JSON.stringify(player));
		if(document.location.href.indexOf("/metagame")!=-1){
			player.stat = Math.max(player.stat,1);
			$("#metapoints").html(formatWhole(player.metapoints));
			$("#metagain").html(format(metagain()));
			$("#1level").html(formatWhole(player.metaupgrades[1]));
			$("#2level").html(formatWhole(player.metaupgrades[2]));
			$("#3level").html(formatWhole(player.metaupgrades[3]));
			$("#4level").html(formatWhole(player.metaupgrades[4]));
			$("#1effect").html(format(metaeffect(1)));
			$("#2effect").html(format(metaeffect(2)));
			$("#3effect").html(format(metaeffect(3)));
			$("#4effect").html(format(metaeffect(4)));
			$("#1cost").html(formatWhole(metacost(1)));
			$("#2cost").html(formatWhole(metacost(2)));
			$("#3cost").html(formatWhole(metacost(3)));
			$("#4cost").html(formatWhole(metacost(4)));
			$("#trans").css("display",(player.metatranscension.gt(0)||player.metaprestige.gte(1e9))?"":"none");
			$("#prestige_milestone").css("display",(player.metaprestige.gt(0))?"":"none");
			$("#trans_milestone").css("display",(player.metatranscension.gt(0))?"":"none");
			$("#milestone0").css("display",(player.metapoints.gte(1e4)||player.metaupgrades[2].gte(1))?"":"none");
			$("#upg2").css("display",(player.metapoints.gte(1e4)||player.metaupgrades[2].gte(1))?"":"none");
			$("#milestone1").css("display",(player.metapoints.gte(1e6)||player.metaupgrades[3].gte(1))?"":"none");
			$("#upg3").css("display",(player.metapoints.gte(1e6)||player.metaupgrades[3].gte(1))?"":"none");
			$("#milestone2").css("display",(player.metapoints.gte(1e9)||player.metaprestige.gte(1)||player.metatranscension.gte(1))?"":"none");
			$("#prestige").css("display",(player.metapoints.gte(1e9)||player.metaprestige.gte(1)||player.metatranscension.gte(1))?"":"none");
			$("#milestone3").css("display",(player.metaprestige.gte(1))?"":"none");
			$("#upg4").css("display",(player.metaprestige.gte(1))?"":"none");
			$("#milestone4").css("display",(player.metaprestige.gte(50))?"":"none");
			$("#milestone5").css("display",(player.metaprestige.gte(200))?"":"none");
			$("#milestone6").css("display",(player.metaprestige.gte(1e4))?"":"none");
			$("#milestone7").css("display",(player.metaprestige.gte(1e6))?"":"none");
			$("#milestone8").css("display",(player.metaprestige.gte(1e9))?"":"none");
			$("#milestone9").css("display",(player.metatranscension.gte(1))?"":"none");
			$("#milestone10").css("display",(player.metatranscension.gte(50))?"":"none");
			$("#milestone11").css("display",(player.metatranscension.gte(200))?"":"none");
			$("#milestone12").css("display",(player.metatranscension.gte(1e4))?"":"none");
			$("#milestone13").css("display",(player.metatranscension.gte(1e6))?"":"none");
			$("#milestone14").css("display",(player.metapoints.gte(Number.MAX_VALUE))?"":"none");
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
		let mpps=presgain().mul(1000).div(Date.now()-player.lastprestige+111);
		if(player.metaprestige.gte(200)&&document.location.href.indexOf("/metagame")!=-1){
			$("#milestone2display").html(format(mpps));
		}
		if(player.metaprestige.gte(1e4)&&document.location.href.indexOf("/metagame")!=-1){
			$("#milestone3display").html(format(player.metaprestige.max(1).log10().div(4).pow(2).max(1).min(50)));
		}
		if(player.metatranscension.gte(50)&&document.location.href.indexOf("/metagame")!=-1){
			$("#milestone7display").html(format(presgain().add(100).mul(player.metatranscension.gte(1e4)?(1+((total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(30).toNumber()+player.metatranscension.add(1).log10().mul(100).toNumber())/10000)**3):1)));
		}
		if(player.metatranscension.gte(200)&&document.location.href.indexOf("/metagame")!=-1){
			$("#milestone8display").html(format(transgain().mul(1000).div(Date.now()-player.lasttranscension+111)));
		}
		if(player.metatranscension.gte(1e4)&&document.location.href.indexOf("/metagame")!=-1){
			$("#milestone9display").html(format(1+((total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(30).toNumber()+player.metatranscension.add(1).log10().mul(100).toNumber())/10000)**3));
		}
		if(document.location.href.indexOf("/incrementalgames")!=-1){
			if(player.stat>=1)$("#metagamelink").html((localStorage.lang==1?"元-游戏 -- 分数：":"Metagame -- Points: ")+Math.floor(player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(30).toNumber()+player.metatranscension.add(1).log10().mul(100).toNumber()));
			$("#total_points1").html(Math.floor(total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(30).toNumber()+player.metatranscension.add(1).log10().mul(100).toNumber()));
			$("#total_points2").html(Math.floor(total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(30).toNumber()+player.metatranscension.add(1).log10().mul(100).toNumber()));
		}
		if(document.location.href.indexOf("/b.html")!=-1){
			$("#result").html((sha512_256(localStorage.supporterCode+"loader3229").slice(2) == '97b4061c3a44e2950549613ba148eff34250441a9b3121698a15fcefdb4f5a')?["<br>Supporter Code Valid!","<br>捐赠码输入正确！"][localStorage.lang]:["<br>Supporter Code Invalid or you did not input it!","<br>捐赠码输入错误或者没有输入捐赠码！"][localStorage.lang]);
		}
		player.tick=Date.now();
	}catch(e){console.log(e);}
},50);

function metagain(){
	if(player.stat == 0)return new Decimal(0);
	let ret=metaeffect(1).mul(metaeffect(2)).mul(metaeffect(3)).mul(metaeffect(4)).mul(preseffect()).mul(transeffect());
	if(window.sha512_256 === undefined)return ret;
	if(sha512_256(localStorage.supporterCode+"loader3229").slice(2) == '97b4061c3a44e2950549613ba148eff34250441a9b3121698a15fcefdb4f5a')ret = ret.mul(3);
	return ret;
}

function metaeffect(a){
	if(a==1){
		let ret=Decimal.pow(Math.log10(Math.max(Math.min(total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(30).toNumber()+player.metatranscension.add(1).log10().mul(100).toNumber(),20000)+100,1))/2,player.metaupgrades[1]);
		return ret;
	}
	if(a==2){
		let ret=Decimal.pow(Decimal.log10(player.metapoints.add(100)),player.metaupgrades[2].pow(0.75).div(2));
		return ret;
	}
	if(a==3){
		var intimacy=parseFloat(localStorage.kasumiIntimacy);
		if(!isFinite(intimacy))intimacy = 0;
		if(intimacy>1e12)intimacy=1e12;
		localStorage.kasumiIntimacy=intimacy;
		let ret=Decimal.pow(Math.log10(intimacy+10),player.metaupgrades[3].pow(0.75).div(4));
		return ret;
	}
	if(a==4){
		let ret=Decimal.pow(Math.log10(Date.now()-player.lastprestige+1),player.metaupgrades[4].pow(0.8).div(player.metaprestige.gte(1e6)?Math.max(5-(Math.log10(Date.now()-player.lastprestige+1)/2)**1.5,player.metatranscension.gte(1e6)?1.5:2):5));
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
	if(a==4){
		let ret=Decimal.pow(5,player.metaupgrades[4].add(11).pow(1.4));
		return ret;
	}
}

function metaupgrade(a){
	var cost=metacost(a);
	if(player.metapoints.gte(cost)){
		if(player.metaprestige.lt(50))player.metapoints=player.metapoints.sub(cost);
		player.metaupgrades[a]=player.metaupgrades[a].add(1);
		player.stat=Date.now();
		localStorage.metagame=btoa(JSON.stringify(player));
	}
}

function presgain(){
	if(player.metainf.gte(1))return Decimal.pow(10,player.metapoints.add(1).log10().sqrt().sub(3)).mul(transeffect()).mul(metainfeffect()).mul((sha512_256(localStorage.supporterCode+"loader3229").slice(2) == '97b4061c3a44e2950549613ba148eff34250441a9b3121698a15fcefdb4f5a')?2:1);
	if(player.metatranscension.gte(1))return Decimal.pow(10,player.metapoints.add(1).log10().sqrt().sub(3)).mul(transeffect()).mul((sha512_256(localStorage.supporterCode+"loader3229").slice(2) == '97b4061c3a44e2950549613ba148eff34250441a9b3121698a15fcefdb4f5a')?2:1);
	if(player.metapoints.lt(1e9))return new Decimal(0);
	return Decimal.pow(10,player.metapoints.add(1).log10().sqrt().sub(3)).mul((sha512_256(localStorage.supporterCode+"loader3229").slice(2) == '97b4061c3a44e2950549613ba148eff34250441a9b3121698a15fcefdb4f5a')?2:1);
}

function preseffect(){
	if(player.metatranscension.gte(1))return player.metaprestige.add(1);
	return player.metaprestige.add(1).sqrt();
}

function metaprestige(){
	player.metaprestige=player.metaprestige.add(presgain());
	player.metapoints=new Decimal(0);
	player.metaupgrades=[new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0)];
	player.stat=player.lastprestige=Date.now();
	localStorage.metagame=btoa(JSON.stringify(player));
}

function transgain(){
	if(player.metainf.gte(1))return Decimal.pow(10,player.metaprestige.add(1).log10().sqrt().sub(3)).mul(metainfeffect());
	if(player.metaprestige.lt(1e9))return new Decimal(0);
	return Decimal.pow(10,player.metaprestige.add(1).log10().sqrt().sub(3));
}

function transeffect(){
	return player.metatranscension.add(1);
}

function metainfgain(){
	return player.metapoints.add(1).log2().add(1).log2().div(5).pow(6).sub(player.metainf).div(8).sub(7).floor().max(0);
}

function metainfeffect(){
	return player.metainf.add(1);
}

function metainfeffect2(){
	return transgain().sqrt().mul((1+((total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(30).toNumber()+player.metatranscension.add(1).log10().mul(100).toNumber())/10000)**2)).add(player.metainf.sqrt()).mul(player.metainf.sqrt());
}

function metatranscension(){
	player.metatranscension=player.metatranscension.add(transgain());
	player.metaprestige=new Decimal(0);
	player.metapoints=new Decimal(0);
	player.metaupgrades=[new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0)];
	player.stat=player.lastprestige=player.lasttranscension=Date.now();
	localStorage.metagame=btoa(JSON.stringify(player));
}

function metainf(){
	if(metainfgain().lte(0))return;
	player.metainf=player.metainf.add(metainfgain());
	player.metatranscension=new Decimal(0);
	player.metaprestige=new Decimal(0);
	player.metapoints=new Decimal(0);
	player.metaupgrades=[new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0),new Decimal(0)];
	player.stat=player.lastprestige=player.lasttranscension=Date.now();
	localStorage.metagame=btoa(JSON.stringify(player));
}

/** Live2D Character */

l2d_force_change='';
localStorage.kasumiIntimacy=localStorage.kasumiIntimacy || '0';
localStorage.kasumiLivecount=localStorage.kasumiLivecount || '0';

function getIntimacyGain(a){
	a=a*(parseInt(localStorage.kasumiLivecount)/2+1);
	a=a*(player.metaprestige.max(1).log10().div(4).pow(2).max(1).min(50).toNumber());
	return a;
}

function addIntimacy(a){
	localStorage.kasumiIntimacy=Math.min(parseFloat(localStorage.kasumiIntimacy)+getIntimacyGain(a),1e12);
}


if(localStorage.l2dv!='1'){
	localStorage.l2dv='1';
	localStorage.l2dmv='0';
	localStorage.l2dm=localStorage.l2dm || '/l2d_models/kasumievent130.json';
}

if(localStorage.lang!='1')localStorage.lang='0';

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
	profile: ['Do you want to see my profile?','想看一下我的档案吗？'],
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
	});*/
	$('.waifu-tool .fui-folder').hover(function (){
		showMessage(live2d_messages.profile[localStorage.lang],3000);
	});
	$('.waifu-tool .fui-folder').click(function (){
		document.location.href='/ksm.html';
	});/*
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

var message_time=0,message_force=0,message_stat=0;
setInterval(function(){
	if(Date.now()<message_time && message_stat==0){
		$('.waifu-tips').fadeTo(200, 1);message_stat=1;
	}else if(Date.now()>message_time && message_stat==1){
		$('.waifu-tips').fadeTo(200, 0);message_stat=0;message_force=0;
	}
},50);

function showMessage(text, timeout, flag) {
	if(flag==true)flag=1;
	flag=parseInt(flag);
	if(!isFinite(flag))flag=0;
    if(flag >= message_force){
        if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
        console.log('[Message]', text.replace(/<[^<>]+>/g,''));
		message_force=flag;
        $('.waifu-tips').html(text);
        if (timeout === undefined) timeout = 5000;
        hideMessage(timeout);
    }
}

function hideMessage(timeout) {
	message_time=Date.now()+timeout;
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


// Page Level

var plstyle=document.createElement('style');
plstyle.innerHTML='#plbar{position:fixed;height:10px;bottom:0px;left:0px;background-color:#0000ff;}#pldisp{position:fixed;bottom:10px;left:0px;user-select:none;}#pldiv{height:40px;}';
document.head.append(plstyle);
var plbar=document.createElement('div');
plbar.id='plbar';
document.body.append(plbar);
var pldisp=document.createElement('div');
pldisp.id='pldisp';
document.body.append(pldisp);
var pldiv=document.createElement('div');
pldiv.id='pldiv';
document.body.append(pldiv);

setInterval(function(){
	var pl=(Math.log10(parseFloat(localStorage.pageopencount)/10+1)+Math.min(Math.log10(parseFloat(localStorage.kasumiIntimacy)/1000+1),9)+Math.log10((total_points+player.metapoints.add(1).log10().mul(10).toNumber()+player.metaprestige.add(1).log10().mul(30).toNumber()+player.metatranscension.add(1).log10().mul(100).toNumber())/10+1))**1.5;
	pl=pl*2+1;
	pldisp.innerHTML="Level "+Math.floor(pl);
	plbar.style.width=((pl-Math.floor(pl))*100)+"%";
},10);