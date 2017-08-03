/*!
pithy.teemplate.helper.js
helper for pithy.teemplate, not necessary
by anlige @ 2017-07-28
*/

;(function(_pjt){
	if(!_pjt){
		throw 'Exception: Pjt is not found!';
	}
	function html(id, contents){
		var element = typeof id == 'string' ? document.getElementById(id) : id;
		if(contents === undefined){
			return element ? element.innerHTML : '';
		}
		element && (element.innerHTML = contents);
	}
	
	function __container(text){
		this.text = text;
	}
	__container.prototype.valueOf = __container.prototype.toString = function(){
		return this.text;
	};

	function extend(props){
		function __contruct(){
			__container.apply(this, arguments);
		}
		__contruct.prototype = new __container();
		for(var name in props){
			if(!props.hasOwnProperty(name)){
				continue;
			}
			__contruct.prototype[name] = props[name];
		}
		return __contruct;
	};

	var __appender = extend({
		appendTo : function(id){
			html(id, this.text);
			return this;
		}
	});

	var __render = extend({
		render : function(data){
			return new __appender(_pjt.render(this.text, data));
		}
	});

	
	var __initlize = function(){};

	/*
		content : template text need to be compiled
		return : __render instance
	*/
	__initlize.compile = function(content){
		return new __render(_pjt.compile(content));
	};

	/*
		content : compiled-text
		data	: data need to be rendered
		return : rendered-result(text)
	*/
	__initlize.render = function(content, data){
		return _pjt.render(content, data);
	};


	/*
		try to execute script append by innerHTML
		ele	: html element, contains rendered-result need to be exexute
	*/
	__initlize.execute = function(ele){
		var scripts = ele.getElementsByTagName('script');
		if(scripts.length == 0 ){
			return;
		}
		var script = null;
		for(var i = 0; i < scripts.length; i++){
			script = scripts[i];
			if(script.src){
				var _script = document.createElement('script');
				_script.src = script.src;
				script.parentNode.replaceChild(_script, script);
			}else{
				(new Function(script.innerHTML))();
			}
		}
	};


	/*
		data : data need to be rendered
		src  : html element, contains template text need to be compiled
		dest : 	1¡¢html element, show rendered-result
				2¡¢function, arg1 is rendered-result
	*/
	__initlize.bind = function(data, src, dest){

		var contents = html(src);
		if(!contents){
			return '';
		}
		
		contents = _pjt.compile(contents);

		var result = _pjt.render(contents, data);
		if(typeof dest == 'function'){
			dest(result);
		}else{
			html(dest, result);
		}
	};
	
	window.PjtHelper = __initlize;
})(window.Pjt);