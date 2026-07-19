setInterval(function(){
	window.supporterCodeInput = (sha512_256(localStorage.supporterCode+"loader3229").slice(2) == '71fcb6c48d87276cfcaf7db32358649f23c82461d543509061a0e783f04be5');
	let ua=navigator.userAgent || '';
	ua = ua.toLowerCase();
	if(ua.indexOf("qqtheme")!=-1 || ua.indexOf("qqapp")!=-1 || ua.indexOf("qqex")!=-1 || ua.indexOf("qqweb")!=-1 || ua.indexOf("wechat")!=-1 || ua.indexOf("weixin")!=-1){
		if(document.location.href.indexOf("copytovisit.html")==-1){
			document.location.href="https://loader3229.github.io/copytovisit.html?"+document.location.href;
		}
	}
},10);