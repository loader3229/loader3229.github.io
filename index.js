// Language Settings

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

// Incremental Games

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





total_points=Math.floor(total_points);

try{
	if(document.location.href.indexOf("/incrementalgames")!=-1){
		$("#total_points1").html(total_points);
		$("#total_points2").html(total_points);
	}
}catch(e){}



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


var player={
	metapoints: new Decimal(0),
	metaupgrades: [new Decimal(0),new Decimal(0),new Decimal(0)]
};

try{
	var player_saved=JSON.parse(atob(localStorage.metagame));
	player.metapoints=new Decimal(player_saved.metapoints);
	player.metaupgrades[1]=new Decimal(player_saved.metaupgrades[1]);
	player.metaupgrades[2]=new Decimal(player_saved.metaupgrades[2]);
}catch(e){}

var tick=Date.now();

setInterval(function(){try{
	player.metapoints=metagain().mul(Date.now()-tick).div(1000).add(player.metapoints);
	localStorage.metagame=btoa(JSON.stringify(player));
	if(document.location.href.indexOf("/metagame")!=-1){
		$("#metapoints").html(formatWhole(player.metapoints));
		$("#metagain").html(format(metagain()));
		$("#1level").html(formatWhole(player.metaupgrades[1]));
		$("#2level").html(formatWhole(player.metaupgrades[2]));
		$("#1effect").html(format(metaeffect(1)));
		$("#2effect").html(format(metaeffect(2)));
		$("#1cost").html(formatWhole(metacost(1)));
		$("#2cost").html(formatWhole(metacost(2)));
	}
	tick=Date.now();
}catch(e){console.log(e);}
},100);

function metagain(){
	let ret=metaeffect(1).mul(metaeffect(2));
	if(sha512_256(localStorage.supporterCode+"milestone").slice(1) == '91e43d5c20c41cc3b9da6da2a2aadc9ce35b27605ecb39c86a29bccbce145bf')ret = ret.mul(3);
	return ret;
}

function metaeffect(a){
	if(a==1){
		let ret=Decimal.pow(Math.log10(Math.max(Math.min(total_points,10000)+100,1))/2,player.metaupgrades[1]);
		return ret;
	}
	if(a==2){
		let ret=Decimal.pow(Decimal.log10(player.metapoints.add(100)),player.metaupgrades[2]/2.5);
		return ret;
	}
}

function metacost(a){
	if(a==1){
		let ret=Decimal.pow(1.5,player.metaupgrades[1].add(6).pow(1.1));
		if(player.metaupgrades[1].gte(20))ret=Decimal.pow(1.5,player.metaupgrades[1].pow(1.2));
		return ret;
	}
	if(a==2){
		let ret=Decimal.pow(3,player.metaupgrades[2].add(5).pow(1.4));
		return ret;
	}
}

function metaupgrade(a){
	var cost=metacost(a);
	if(player.metapoints.gte(cost)){
		player.metapoints=player.metapoints.sub(cost);
		player.metaupgrades[a]=player.metaupgrades[a].add(1);
	}
}