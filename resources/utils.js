/*!
useful functions
*/
function id(id){
	return document.getElementById(id);
}
function on(ele, ev, handler, cap){
	if(typeof ele == 'string'){
		ele = id(ele);
	}
	if(ele.addEventListener){
		ele.addEventListener(ev, handler, cap===true);
	}else if(ele.attachEvent){
		ele.attachEvent("on" + ev, handler);
	}else{
		ele["on" + ev] = handler;
	}
};
function off_one(ele, ev, handler, cap){
	if(typeof ele == 'string'){
		ele = id(ele);
	}
	if(ele.removeEventListener){
		ele.removeEventListener(ev, handler, cap===true);
	}else if(ele.detachEvent){
		ele.detachEvent("on" + ev, handler);
	}else{
		ele["on" + ev] = null;
	}
}
