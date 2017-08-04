/*!
pithy.teemplate.js
teemplate, not template
javascript template parse engine;
by anlige @ 2017-07-23
*/

;(function(_pjt){
	if(!_pjt){
		throw 'Exception: Pjt is not found!';
	}
	var empty_chars = {'\t' : true, ' ' : true};
	

	
	var chr = '';

	
	//map something
	var token_chars = '0123456789qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM_';
	var token_chars_map = {};

	for(var i=0; i< token_chars.length; i++){
		chr = token_chars.substr(i, 1);
		token_chars_map[chr] = true;
	}
	
	var TOKEN = {
		MASTER : 'master',
		EXTENDS : 'extends',
		SECTION : 'section',
		ENDSECTION : 'endsection',
		LINE : 'line',
	};
	function next_token(_token, words){
		var token = '',
			chr = '',
			start = _token.start,
			end = _token.end;
		
		while(start < end){
			chr = words[start];
			if(empty_chars[chr] && token == ''){
				start++;
				continue;
			}
			if(!token_chars_map[chr]){
				break;
			}
			token += words[start];
			start++;
		}
		switch(token){
			case 'master' :
			case 'extends' :
			case 'section' :
			case 'endsection' :
				_token.start = start;
				_token.type = token;
				break;
		}
	}
	function token(start, end, words){
		var chr = words[start];
		var _token = {
			start : start,
			end : end,
			type : '',
			html_tag : ''
		};
		if(chr == '@'){
			if(start + 1 == end){
				throw 'syntax error \'' + words.slice(start, end).join('') + '\'';
			}
			_token.start++;
			
			next_token(_token, words);
			if(_token.type == ''){
				_token.type = TOKEN.LINE;
				_token.start = start;
			}
		}else{
			_token.type = TOKEN.LINE;
		}
		return _token;
	}

	function __view(name){
		this.sections = {};
		this.name = name;
	}

	__view.prototype.push = function(name, contents){
		this.sections[name] = contents;
	};
	
	function __layout(){
		__view.apply(this, arguments);
		this.layout = [];
	}

	__layout.prototype = new __view();

	function __section(){
		
	}

	function __initlize(){
		
	}
	
	__initlize.compile = function(content){
		
		var result = [];
		var __LINE__ =  0;

		content = content.replace(/^([\r\n]+)/, '');
		
		
		function exception(e, start, fullline){
			return 'Exception : ' + e + '\nLine: ' + __LINE__ + '\nCode: ' + fullline;
		}
		var _container
		_pjt.scanline(content, function(start, end, words, line_num, emptys){
			__LINE__ = line_num;
			var _token = null;
			var fullline = content.slice(start, end);
			try{
				_token = token(start, end, words);
			}catch(e){
				throw exception(e, start, fullline);
			}
			var linetext = content.slice(_token.start, _token.end);
			console.log(linetext);
			
		});
		var code = result.join('\r\n');

		return code;
	};

	
	window.PjtExtends = __initlize;
})(window.Pjt);