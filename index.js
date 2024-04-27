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