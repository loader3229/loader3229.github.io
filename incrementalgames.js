try{
	$("#milestone1").html(JSON.parse(atob(localStorage.c2nv4in9eusojg59bmo)).m.points);
	$("#milestone2").html(JSON.parse(atob(localStorage.c2nv4in9eusojg59bmo)).m.points);
}catch(e){}

try{
	var tmp=0;
	for(var i=1;i<=7;i++){tmp+=parseInt(JSON.parse(atob(localStorage.multitree)).tm.buyables[i]);};
	$("#multitree1").html(tmp);
	$("#multitree2").html(tmp);
}catch(e){}

try{
	var tmp=0;
	JSON.parse(atob(atob(localStorage.zbkc).split(',')[12])).filter(function(a){a.filter(function(b){if(Number.isFinite(b))tmp+=b;})});
	$("#zbkc1").html(tmp);
	$("#zbkc2").html(tmp);
}catch(e){}
