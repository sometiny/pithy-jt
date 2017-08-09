/*!
pithy.teemplate.htmltag.js
transfer htmltag-typed template to razor
by anlige @ 2017-08-05
*/

;(function(_pjt){
	if(!_pjt){
		throw 'Exception: Pjt is not found!';
	}
	var TOKEN = _pjt.TOKEN;
	var operate_map = { eq : '==', neq : '!=', gt : '>', egt : '>=', lt : '<', elt : '<='};
	var tags = { eq : '==', neq : '!=', gt : '>', egt : '>=', lt : '<', elt : '<=', 'if' : 'if', 'each' : 'each', 'foreach' : 'foreach', 'for' : 'for','else' : 'else'};

	function parsehtmltag(token, words){
		if(!tags[token.html_tag]){
			return;
		}
		var start = token.start + token.html_tag.length + 1;
		var _start = start, _end = start, quot = false, chr, last_property;
		var properties = {};
		
		while(_end < token.end){
			chr = words[_end];
			if(chr == '"'){
				if(!quot){
					quot = true;
				}else{
					quot = false;
					properties[last_property] = words.slice(_start, _end).join('');
				}
				_start = _end + 1;
				_end = _start;
				continue;
			}
			if(quot){
				_end++;
				continue;
			}
			if(chr == ' '){
				_start++;
				_end++;
				continue;
			}
			if(chr == '='){
				last_property = words.slice(_start, _end).join('');
			}
			_end++;
		}
		return properties;
	}

	function htmltagend(token){
		var tag = token.html_tag.toLowerCase();
		switch(tag){
			case 'if' :
			case 'eq' :
			case 'neq' :
			case 'gt' :
			case 'lt' :
			case 'elt' :
			case 'egt' :
			case 'each' :
			case 'foreach' :
			case 'for' :
				token.linetext = '}';
				token.type = TOKEN.CODE;
				break;
		}
	}
	function exception(e, token, words){
		return 'Exception : ' + e + '\nLine: ' + token.lineno + '\nCode: ' + words.slice(token.start, token.end).join('');
	}
	function exception_prop_missing(name, token, words){
		return 'Exception : \'' + name + '\' property is missing.\nLine: ' + token.lineno + '\nCode: ' + words.slice(token.start, token.end).join('');
	}
	function exception_name_value_missing(token, words){
		return 'Exception : \'name\' or \'value\' property is missing.\nLine: ' + token.lineno + '\nCode: ' + words.slice(token.start, token.end).join('');
	}
	function htmltag(token, words){
		var props = parsehtmltag(token, words);
		if(props === undefined){
			return;
		}
		var tag = token.html_tag.toLowerCase();
		switch(tag){
			case 'if' :
				if(!props.condition){
					throw exception_prop_missing('condition', token, words);
				}
				token.type = TOKEN.IF;
				token.linetext = ' (' + props.condition + ') {';
				break;
			case 'eq' :
			case 'neq' :
			case 'gt' :
			case 'egt' :
			case 'lt' :
			case 'elt' :
				if(!props.name){
					throw exception_prop_missing('name', token, words);
				}
				token.type = TOKEN.IF;
				token.linetext = ' (' + props.name + ' ' + operate_map[tag] + ' ' + props.value + ') {';
				break;
			case 'elseif' :
				if(!props.name){
					throw exception_prop_missing('name', token, words);
				}
				token.type = TOKEN.CODE;
				token.linetext = '} else if (' + props.name + ' ' + operate_map[tag] + ' ' + props.value + ') {';
				break;
			case 'for' :
				if(!props.end){
					throw exception_prop_missing('end', token, words);
				}
				token.type = TOKEN.FOR;
				var key = props.key || ('__key__' + line);
				var start = props.start || '0';
				var end = props.end;
				var step = props.step || '1';
				var compare = props.compare || '<';
				token.linetext = '( var ' + key + ' = ' + (props.start || '0') + '; ' + key + ' ' + compare + ' ' + end + '; ' + key + ' += ' + step + ' ){';
				break;
			case 'each' :
			case 'foreach' :
				if(!props.name){
					throw exception_prop_missing('name', token, words);
				}
				token.type = tag;
				var args = [];
				args.push(props.name);
				args.push('as');
				if(props.key){
					args.push(props.key);
					args.push(',');
				}
				args.push(props.value || 'value');
				args.push('{');
				token.linetext = args.join(' ');
				break;
			case 'else' :
				token.linetext = '}else{';
				token.type = TOKEN.CODE;
				break;
		}
	}
	
	_pjt.subscribe(TOKEN.HTML, htmltag);
	_pjt.subscribe(TOKEN.HTMLEND, htmltagend);
	
})(window.Pjt);