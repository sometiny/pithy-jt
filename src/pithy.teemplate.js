/*!
pithy.teemplate.js
teemplate, not template
javascript template parse engine;
by anlige @ 2017-07-23
*/

;(function(){
	var global_setting = {
		trim_start : true,
		strict : true,
		escape : false
	};
	var blank_chars = {'\r' : true, '\n' : true, '\t' : true, ' ' : true};
	var newline_chars = {'\r' : true, '\n' : true};
	var empty_chars = {'\t' : true, ' ' : true};
	var quoto_chars = {'"' : true, '\'' : true};
	
	var PAIRS = {')' : '(', '}' : '{', ']' : '['};
	var PAIRS2 = {'(' : ')', '{' : '}', '[' : ']'};

	
	var push = Array.prototype.push;
	var toString = Object.prototype.toString;
	var chr = '';
	var VARIABLE_NAME = '__con__';

	
	//map something
	var token_chars = '0123456789qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM_';
	var token_chars_map = {};
	var operate_chars = '+-*/%\\^|&!.?|=:~ <>,';
	var operate_chars_map = {};

	for(var i=0; i< token_chars.length; i++){
		chr = token_chars.substr(i, 1);
		token_chars_map[chr] = true;
	}
	for(var i=0; i< operate_chars.length; i++){
		chr = operate_chars.substr(i, 1);
		operate_chars_map[chr] = true;
	}
	
	function scanline(content, callback){
		if(!content || typeof content != 'string'){
			return;
		}
		var _callback = function(start, end, words, line_num, emptys){
			if(start == end){
				return;
			}
			var last = end - 1;
			while(last >= start){
				if(empty_chars[words[last]]){
					last--;
				}else{
					break;
				}
			}
			callback(start, last + 1, words, line_num, emptys);
		};
		var words = content.split('');
		var length = words.length;
		var lenth2 = length - 1;
		var index = 0;

		var chr = '';
		var line = '';
		var start = 0;
		var newline = true; 
		var line_num = 0;
		var emptys = '';
		while(true){
			chr = words[index];
			if(	newline_chars[chr]){
				newline = true;
				line_num++;
				_callback(start, index, words, line_num, emptys);
				start = index + 1;
				emptys = '';
				
				if(chr == '\r'){
					if(index < length - 1 && words[index + 1] == '\n'){
						index++;
						start = index + 1;
					}
				}
			}else if(newline && empty_chars[chr]){
				emptys += chr;
				start++;
				
			}else{
				newline = false;
				
			}
			index++;
			
			if(index >= length){
				line_num++;
				_callback(start, index, words, line_num, emptys);
				break;
			}
		}
	}
	var TOKEN = {
		IF : 'if',
		FOR : 'for',
		FOREACH : 'foreach',
		EACH : 'each',
		SWITCH : 'switch',
		WHILE : 'while',
		NORMAL : 'normal',
		CODE : 'code',
		HTML : 'html',
		LINE : 'line',
		REGION : 'region',
		ENDREGION : 'endregion'
	};
	function next_token(token_type, words){
		var token = '',
			chr = '',
			start = token_type.start,
			end = token_type.end;
		
		while(start < end){
			chr = words[start];
			if(empty_chars[chr] && token == ''){
				start++;
				continue;
			}
			if(chr == ':'){
				token_type.start = start + 1;
				token_type.type = TOKEN.LINE;
				return;
			}
			if(chr == '{'){
				token_type.start = start;
				token_type.type = TOKEN.CODE;
				return;
			}
			if(!token_chars_map[chr]){
				break;
			}
			token += words[start];
			start++;
		}
		switch(token){
			case 'if' :
			case 'for' :
			case 'switch' :
			case 'while' :
			case 'foreach' :
			case 'each' :
			case 'region' :
			case 'endregion' :
				token_type.start = start;
				token_type.type = token;
				break;
		}
	}
	function token(start, end, words){
		var chr = words[start];
		var token_type = {
			start : start,
			end : end,
			type : '',
			html_tag : ''
		};
		if(chr == '<'){
			token_type.type = TOKEN.HTML;
			var next = start + 1;
			while(next < end){
				chr = words[next];
				if(chr == '/'){
					token_type.type = TOKEN.HTMLEND;
					next++;
					start++;
					continue;
				}
				if(!token_chars_map[chr]){
					break;
				}
				next++;
			}
			if(next > start + 1){
				token_type.html_tag = words.slice(start + 1, next).join('')
			}
		}
		else if(chr == '@'){
			if(start + 1 == end){
				throw 'syntax error \'' + words.slice(start, end).join('') + '\'';
			}
			token_type.start++;
			
			//in fact, it can be simplized
			next_token(token_type, words);
			if(token_type.type == ''){
				//throw 'error on line : ' + words.slice(start, end).join('');
				token_type.type = TOKEN.LINE;
				token_type.start = start;
			}
		}else{
			token_type.type = TOKEN.NORMAL;
		}
		return token_type;
	}

	function line(start, end, words, escape){
		if(start == end){
			return [];
		}

		var length = end;
		var index = start;

		var token = '', 
			chr = '';

		var result = [];
		var part = '';
		var part_end = 0; 
		var variable_expression = '';
		
		while(true){
			if(index== length){
				break;
			}
			chr = words[index];
			if(chr == '@'){
				if(index < length - 1 && words[index + 1] == '@'){
					part += '@';
					index += 2;
					continue;
				}
				if(index == length - 1){
					part += '@';
					break;
				}
				part_end = check_syntax(index + 1, words.length, words, []);
				if(part_end > index + 1){
					result.push(VARIABLE_NAME + ' += "' + part.replace(/"/g, '\\"') + '";');
					variable_expression = words.slice(index + 1, part_end).join('');
					index = part_end - 1;
					part = '';
					result.push(VARIABLE_NAME + ' += ' + (escape ? '__helper.escape(' : '') + variable_expression + (escape ? ')' : '') + ';');
				}else{
					part += '@';
				}
			}else{
				part += chr;
			}
			index++;
		}
		if(part){
			result.push(VARIABLE_NAME + ' += "' + part.replace(/"/g, '\\"') + '";');
		}
		return result;
	}
	
	
	function check_syntax(start, end, words, levels, verify){
		var chr = '',
			quote = false,
			stop = false,
			_start = start,
			expect,
			quote_char = '';
		
		verify = verify === true;
		var first_chr = '';
		while(true){
			if(start >= end){
				break;
			}
			chr = words[start];
			if(!first_chr && chr == '('){
				first_chr = chr;
			}
			if(quoto_chars[chr]){
				if(levels.length == 0){
					break;
				}
				if(!quote){
					quote = true;
					_start = start;
					quote_char = chr;
				}else if(quote && words[start - 1] != '\\' && quote_char == chr){
					quote = false;
				}
				start++;
				continue;
			}
			if(quote || chr == '.'){
				start++;
				continue;
			}
			if(PAIRS2[chr]){
				levels.push(chr);
				start++;
				continue;
			}

			if(PAIRS[chr]){
				if(levels.length == 0){
					break;
				}
				if(levels[levels.length -1] != PAIRS[chr]){
					expect = PAIRS2[levels[levels.length -1]];
					throw 'unexpected symbol "' + chr + '"' + (expect ? ', expect "' + PAIRS2[levels[levels.length -1]] + '"' : '') ;
				}
				levels.pop();
				if(!verify){
					if(levels.length ==0 && PAIRS[chr] === first_chr){
						return ++start;
					}
				}
				start++;
				continue;
			}
			if(!verify && operate_chars_map[chr]){
				if(levels.length == 0 ){
					break;
				}
				start++;
				continue;
			}
			if(!verify && !token_chars_map[chr]){
				break;
			}
			
			start++;
		}
		if(quote){
			throw '\' or " missing';
		}
		if(!verify && levels.length !=0){
			throw '"' + PAIRS2[levels[levels.length - 1]] + '" missing';
		}
		return start;
	}

	var helper = {
		escape :function(src){
			if(src === undefined || src === null){
				return src;
			}
			src = src + '';
			if(!src){
				return ;
			}
			return src
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		}
	};

	//compile mutile-string line into one line
	function filter_result(lines){
		var last_is_string = false,
			length = lines.length,
			line = '',
			result = [], 
			last_line = '';
		
		for(var i = 0; i < length; i++){
			line = lines[i];
			if(line.length > VARIABLE_NAME.length + 7 
			&& line.substr(line.length - 2) == '";' 
			&& line.substr(0, VARIABLE_NAME.length + 5) == VARIABLE_NAME + ' += "'){
				if(!last_is_string){
					last_is_string = true;
					result.push(line);
				}else{
					last_line = result[result.length - 1];
					last_line = last_line.substr(0, last_line.length - 2);
					last_line = last_line + line.substr(VARIABLE_NAME.length + 5);
					result[result.length - 1] = last_line;
				}
			}else{
				last_is_string = false;
				result.push(line);
			}
		}
		return result;
	}

	function parse_foreach(line, type, __LINE__){
		
		var parts = /^(?:\s*)(.+?)(?:\s*)as(?:\s*)(?:([^\s]+?)(?:,(?:\s*)([^\s]+?))?)(?:\s*)\{$/.exec(line);
		if(!parts){
			throw 'syntax error for \'foreach\' statement';
		}
		var variable_name = parts[1];
		var key =  parts[2];
		var value =  parts[3];
		if(!value){
			value = key;
			key = '__key_' + __LINE__;
		}
		var lines = [];
		if(type == TOKEN.EACH){
			lines.push('for(var ' + key + ' = 0; ' + key + ' < ' + variable_name + '.length; ' + key + '++){');
		}else{
			lines.push('for(var ' + key + ' in ' + variable_name + '){');
			lines.push('if(!' + variable_name + '.hasOwnProperty(' + key + ')) continue;');
		}
		lines.push('var ' + value + ' = ' + variable_name + '[' + key + '];');
		return lines.join('\n');
	}

	function end_script(linetext, ends){
		var ends_length = ends.length;
		return linetext.length >= ends_length && linetext.substr(linetext.length - ends_length) == ends;
	}

	
	function __initlize(){
		for(var name in global_setting){
			if(!global_setting.hasOwnProperty(name)){
				continue;
			}
			this.config(name, global_setting[name]);
		}
	}
	__initlize.prototype.config = function(name, value){
		if(__initlize.prototype[name]){
			throw 'Exception: can not modify property \'' + name + '\'';
			return;
		}
		this[name] = value;
	};
	
	__initlize.prototype.compile = function(content){
		var result = [];
		var __LINE__ =  0;
		result.push('var ' + VARIABLE_NAME + ' = \'\';');
		if(!this.strict){
			result.push('with($){');
		}

		content = content.replace(/^([\r\n]+)/, '');
		
		var CODE_LEVELS = [];
		
		function exception(e, start, fullline){
			return 'Exception : ' + e + '\nLine: ' + __LINE__ + '\nCode: ' + fullline;
		}
		var trim_start = this.trim_start,
			escape = this.escape,

			last_code_line = '',
			last_line_num = 0,
			last_line_start = 0,
			_region = false;

		
		scanline(content, function(start, end, words, line_num, emptys){
			__LINE__ = line_num;
			var _token = null;
			var fullline = content.slice(start, end);
			try{
				_token = token(start, end, words);
			}catch(e){
				throw exception(e, start, fullline);
			}
			var linetext = content.slice(_token.start, _token.end);
			switch(_token.type){
				case TOKEN.REGION : 
					_region = true;
					break;
				case TOKEN.ENDREGION : 
					_region = false;
					break;	
				case TOKEN.FOREACH : 
				case TOKEN.EACH : 
					try{
						linetext = parse_foreach(linetext, _token.type, __LINE__);
					}catch(e){
						if(typeof e == 'string'){
							throw exception(e, start, fullline);
						}
						throw e;
					}
					_token.type = '';
				
				case TOKEN.IF : 
				case TOKEN.FOR : 
				case TOKEN.SWITCH : 
				case TOKEN.WHILE : 
					linetext = _token.type + linetext;
				case TOKEN.NORMAL : 
				case TOKEN.CODE : 
					if(!_region){
						try{
							//simple syntax parse
							check_syntax(_token.start, _token.end, words, CODE_LEVELS , true);
						}catch(e){
							if(typeof e == 'string'){
								throw exception(e, start, fullline);
							}
							throw e;
						}
						last_code_line = fullline;
						last_line_num = line_num;
						last_line_start = start;
						result.push(linetext);
						break;
					}
				
				case TOKEN.HTML : 
				case TOKEN.HTMLEND : 
				case TOKEN.LINE : 
					try{
						if(!trim_start && emptys){
							result.push(VARIABLE_NAME + ' += "' + emptys + '";');
						}
						push.apply(result, line(_token.start, _token.end, words, escape));
						result.push(VARIABLE_NAME + ' += "\\n";');
					}catch(e){
						if(typeof e == 'string'){
							throw exception(e, start, fullline);
						}
						throw e;
					}
					break;
			}
		});
		
		//syntax parse result
		if(CODE_LEVELS.length != 0){
			__LINE__ = last_line_num;
			throw exception('"' + PAIRS2[CODE_LEVELS[CODE_LEVELS.length - 1]] + '" missing', last_line_start, last_code_line);
		}
		
		if(!this.strict){
			result.push('}');
		}
		result.push('return ' + VARIABLE_NAME + ';');
		result = filter_result(result);
		return result.join('\r\n');
	};
	
	__initlize.prototype.render = function(content, data){
		if(!data || toString.call(data) != '[object Object]'){
			throw 'Exception : data is invalid. it must be an objected-type.';
		}
		if(!this.strict){
			return (new Function('$', '__helper', content))(data, helper);
		}
		
		var keys = [];
		var values = [];
		for(var key in data){
			if(!data.hasOwnProperty(key)){
				continue;
			}
			keys.push(key);
			values.push(data[key]);
		}
		keys.push('__helper');
		values.push(helper);
		var wapper = new Function(keys, content);
		return wapper.apply(null, values);
	};
	helper.typeOf = __initlize.typeOf = function(ele){
		return toString.call(ele);
	};
	
	__initlize.config = function(name, value){
		name == 'trim_start' && (global_setting[name] = value !== false);
		name == 'trim_start' && (global_setting[name] = value !== false);
		name == 'escape' && (global_setting[name] = value !== false);
	};
	
	window.Pjt = __initlize;
})();