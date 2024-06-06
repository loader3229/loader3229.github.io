// Language Settings

function change_language(a){
	localStorage.lang=a;
	document.location.reload();
}
if(localStorage.lang==1){
	$('html').attr('lang','zh-CN');
	$('#nav1').html('增量游戏表');
	//$('#nav2').html('BanG Dream! 自制谱');
	//$('#nav3').html('其他');
	//$('#nav4').html('捐赠');
	document.title=zhtitle;
	$('#lang-style').html('.en{display:none;}');
}else{
	$('html').attr('lang','en');
	$('#nav1').html('Incremental Games');
	//$('#nav2').html('BanG Dream! GBP Fanmade Charts');
	//$('#nav3').html('Others');
	//$('#nav4').html('Donate Me');
	$('#lang-style').html('.zh{display:none;}');
}
$('#nav1').attr('href','/incrementalgames.html');
$('#discord').attr('href','https://discord.gg/jztUReQ2vT');

// Incremental Games

var total_points=0;

try{
	var tmp=parseInt(JSON.parse(atob(localStorage.c2nv4in9eusojg59bmo)).m.points);
	if(Number.isFinite(tmp))total_points+=(tmp*10);else tmp=0;
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
	if(document.location.href.indexOf("/incrementalgames")!=-1){
		$("#total_points1").html(total_points);
		$("#total_points2").html(total_points);
	}
}catch(e){}


