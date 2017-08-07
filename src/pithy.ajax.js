/*
Pithy.js.teemplate.js
*/

;(function(){

	var toString = Object.prototype.toString;
	var slice = Array.prototype.slice;
	var push = Array.prototype.push;
	function create_request() {
		var b = null;
		if (window.XMLHttpRequest) {
			b = new XMLHttpRequest();
			create_request = function() {
				return new XMLHttpRequest();
			}
		} else {
			if (window.ActiveXObject) {
				var httplist = ["MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp", "MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0"];
				for (var i = httplist.length - 1; i >= 0; i--) {
					try {
						create_request = (function(obj) {
							return function() {
								return new ActiveXObject(obj);
							}
						})(httplist[i]);
						b = create_request();
					} catch (ex) {}
				}
			}
		}
		return b;
	};
	function encode(src){
		if(!src || typeof src != 'string'){
			return '';
		}
		return encodeURIComponent(src).replace(/\+/g, '%2B');
	}
	function get_type(type){
		if(!type) {
			throw 'unknown type';
		}
		return type.replace(/\[object (.+?)\]/, '$1').toLowerCase();
	}
	function encode_fields(value, name){
		if(value === null || value === undefined){
			return '';
		}
		var type = get_type(toString.call(value));
		switch(type){
			case 'number':
			case 'boolean':
				value = value.toString();
			case 'string':
				return encode(value);
			case 'array':
				return value
				.map(encode_fields)
				.join('&' + name + '=');
			case 'object':
				return encode_object(value);
			default:
				return '';
		}
	}
	function encode_object(data){
		var result = [];
		for(var name in data){
			if(!data.hasOwnProperty(name)){
				continue;
			}
			result.push(name + '=' + encode_fields(data[name], name));
		}
		return result.join('&');
	}
	function __response(req, callback, error){
		var _contenttype = req.getResponseHeader('Content-Type');
		if(!_contenttype){
			_contenttype = 'text/html';
		}
		if(_contenttype.indexOf(';') > 0){
			_contenttype = _contenttype.substring(0, _contenttype.indexOf(';'));
		}
		_contenttype = _contenttype.toLowerCase();

		var text = req.responseText;
		switch(_contenttype){
			case 'text/json':
			case 'application/json':
				try{
					callback && callback.call(req, (window.JSON && JSON.parse) ? JSON.parse(text) : (new Function('return ' + text + ';'))() );
				}catch(e){
					error && error.call(req, e);
				}
				return;
		}
		callback && callback.call(req, text);
	}
	function __initlize(){
		var url, callback, error, method, data = null, headers, argtype, argvalue;
		for(var i=0; i < arguments.length; i++){
			argvalue = arguments[i];
			argtype = typeof argvalue;
			if(argtype == 'string'){
				if(!url){
					url = argvalue;
					continue;
				}
				if(!method){
					method = argvalue;
					continue;
				}
				if(!data){
					data = argvalue;
					continue;
				}
				continue;
			}
			if(argtype == 'function'){
				if(!callback){
					callback = argvalue;
					continue;
				}
				if(!error){
					error = argvalue;
					continue;
				}
			}
			if(argtype == 'object' && argvalue){
				var objecttype = toString.call(argvalue);
				if(objecttype == '[object Object]' && !data){
					data = encode_object(argvalue);
					continue;
				}
				if(objecttype == '[object Array]'){
					headers = argvalue;
					continue;
				}
			}
		}
		
		method = method ? method.toUpperCase() : 'GET';

		
		
		var body = data;

		var req = create_request();
		req.onreadystatechange = function(){
			if(this.readyState == 4){
				__response(this, callback, error);
			}
		};
		try{
			req.open(method, url, true);
		}catch(e){
			error && error.call(req);
			req = null;
			return;
		}
		var _headers = {};
		if(headers){
			var header = '', idx = -1;
			for(var i=0; i < headers.length; i++){
				header = headers[i];
				if(!header){
					continue;
				}
				idx = header.indexOf(':');
				if(idx > 0 && idx != header.length - 1){
					_headers[header.substring(0, idx)] = true;
					req.setRequestHeader(header.substring(0, idx), header.substring(idx + 1).replace(/^\s+/, ''));
				}
			}
		}
		if(data){
			if(_headers['Content-Type'] !== true){
				req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			}
		}
		req.send(data);
	}
	function require(requirements, length, callback){
		
		var results = [], requirement, completed = 0;
		for(var i = 0; i < length; i++){
			requirement = requirements[i];
			if(requirement.length > 3 && requirement.slice(-3) != '.js'){
				requirement += '.js';
			}
			__initlize(requirement + '?t=' + (+new Date()), (function(index, req_){
				return function(res){
					load_script(req_, index, results, res);
					completed++;
					if(completed == length){
						callback && callback.apply(null, results);
					}
				};
			})(i, requirement));
		}
	}

	function _next(requirement, index, results,  next){
		if(requirement.length > 3 && requirement.slice(-3) != '.js'){
			requirement += '.js';
		}
		__initlize(requirement + '?t=' + (+new Date()), function(res){
			load_script(requirement, index, results, res);
			next(index + 1);
		});
	}

	function next(requirements, length, callback){
		var results = [], completed = 0;
		function __next(index){
			if(index == length){
				callback && callback.apply(null, results);
				return;
			}
			_next(requirements[index], index , results, __next);
		};
		__next(0);
	}

	function load_script(requirement, i, results, contents){
		var module = { exports : {} };
		var return_value = (new Function('module', 'exports', 'requirement', contents ))(module, module.exports, requirement);
		results[i] = return_value === undefined ? module.exports : return_value;
	}

	function arguments_parser(args, func){
		var length = args.length;
		if(length < 1){
			return;
		}
		
		var requirements = [], callback = null, base = null, argc, argt, requires_is_array;

		for(var i = 0; i < length; i++){
			argc = args[i];
			argt = toString.call(argc);
			switch(argt){
				case '[object Array]' :
					requires_is_array = true;
					push.apply(requirements, argc);
					break;
				case '[object String]' :
					if(requires_is_array){
						base = argc;
						break;
					}
					requirements.push(argc);
					break;
				case '[object Function]' :
					callback = argc;
					break;
			}
		}
		length = requirements.length;
		if(length == 0){
			return;
		}
		if(base){
			for(var i=0; i < length; i++){
				requirements[i] = base + requirements[i];
			}
		}
		func(requirements, length, callback);
	}
	__initlize.require = function(){
		arguments_parser(arguments, require);
	};
	__initlize.next = function(){
		arguments_parser(arguments, next);
	};
	
	window.AJAX = __initlize;
})();