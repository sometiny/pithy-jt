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
		function __contruct(text){
			__container.call(this, text);
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
			return new __appender(global_pjt.render(this.text, data));
		}
	});

	
	var global_pjt = null;
	var __initlize = function(){};
	//static compile
	__initlize.compile = function(content){
		if(global_pjt == null){
			global_pjt = new _pjt();
		}
		return new __render(global_pjt.compile(content));
	};

	//static render
	__initlize.render = function(content, data){
		if(global_pjt == null){
			global_pjt = new _pjt();
		}
		return global_pjt.render(content, data);
	};


	//try to execute script append by innerHTML
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

	var __CACHE__ = {};
	
	__initlize.bind = function(data, src, dest){
		var is_id = typeof src == 'string';

		var contents = '';
		
		var pjt = new _pjt();
		if(is_id && __CACHE__[src]){
			contents = __CACHE__[src];
		}else{
			contents = html(src);
			if(!contents){
				return '';
			}
			contents = pjt.compile(contents);
			if(is_id){
				__CACHE__[src] = contents;
			}
		}

		var result = pjt.render(contents, data);
		if(typeof dest == 'function'){
			dest(result);
		}else{
			html(dest, result);
		}
	};
	
	window.PjtHelper = __initlize;
})(window.Pjt);