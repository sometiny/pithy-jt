/*!
pithy.teemplate.htmlhelper.js
by anlige @ 2017-08-04
*/

;(function(_pjt){
	if(!_pjt){
		throw 'Exception: Pjt is not found!';
	}
	/*
	html helper
	*/
	function format(template) {
	    var args = Array.prototype.slice.call(arguments, 1);
	    if (args.length <= 0) return template;
	    return template.replace(/\{(\d+?)\}/g, function ($0, $1) {
	        var val = args[parseInt($1)];
	        if (val === undefined) return "";
	        return val;
	    });
	}
	var parseattrs = function(attrs){
		attrs = attrs || {};
		var ret = "";
		for(var i in attrs){
			if(!attrs.hasOwnProperty(i)) continue;
			ret += format(" {0}=\"{1}\"", i, attrs[i]);
		}
		return ret;
	}
	_pjt.register('ActionLink', function(title, url, attrs){
		return format("<a href=\"{0}\"{1}>{2}</a>", url, parseattrs(attrs), title);
	});
	_pjt.register('Form', function(name, action, method, attrs){
		return format("<form name=\"{2}\" action=\"{0}\"{1} method=\"{3}\">", action, parseattrs(attrs), name, method || "GET");
	});
	_pjt.register('FormUpload', function(name, action, attrs){
		return format("<form name=\"{2}\" action=\"{0}\"{1} method=\"POST\" enctype=\"multipart/form-data\">", action, parseattrs(attrs), name);
	});
	_pjt.register('FormEnd', function(){
		return "</form>";
	});
	_pjt.register('Input', function(type, name, value, attrs){
		var input = "<input type=\"" + type + "\"";
		if(name) input += " name=\"" + name + "\"";
		if(value) input += " value=\"" + value + "\"";
		input += parseattrs(attrs);
		return input + " />";
	});
	_pjt.register('CheckBox', function(name, value,attrs){
		return _pjt.invoke('Input', "checkbox", name, value, attrs);
	});
	_pjt.register('DropDownList', function(name, list, selectedIndex, attrs){
		selectedIndex = selectedIndex || 0;
		var select = "<select name=\"" + name + "\"" + parseattrs(attrs) + ">";
		var index=0;
		if(list.length !== undefined){
			for(var i =0;i<list.length;i++){
				select += format("<option value=\"{0}\"{2}>{1}</option>", list[i], list[i], selectedIndex==list[i] ? " selected=\"selected\"":"");
			}
		}else{
			for(var i in list){
				if(!list.hasOwnProperty(i)) continue;
				select += format("<option value=\"{0}\"{2}>{1}</option>", i, list[i], selectedIndex==index ? " selected=\"selected\"":"");
				index++;
			}
		}
		return select + "</select>";
	});
	_pjt.register('ListBox', function(name, list, selectedIndex, attrs){
		attrs = attrs || {};
		attrs["multiple"] = "multiple";
		return _pjt.invoke('DropDownList', name, list, selectedIndex, attrs);
	});
	_pjt.register('Hidden', function(name, value){
		return _pjt.invoke('Input', "hidden", name, value);
	});
	_pjt.register('Password', function(name, value, attrs){
		return _pjt.invoke('Input', "password", name, value, attrs);
	});
	_pjt.register('RadioButton', function(name, value, attrs){
		return _pjt.invoke('Input', "radio", name, value, attrs);
	});
	_pjt.register('TextArea', function(name, value, attrs){
		return format("<textarea name=\"{0}\"{2}>{1}</textarea>", name, value, parseattrs(attrs));
	});
	_pjt.register('TextBox', function(name, value, attrs){
		return _pjt.invoke('Input', "text", name, value, attrs);
	});
	_pjt.register('Button', function(name, value, attrs){
		return _pjt.invoke('Input', "button", name, value, attrs);
	});
	_pjt.register('ResetButton', function(name, value, attrs){
		return _pjt.invoke('Input', "reset", name, value, attrs);
	});
	_pjt.register('SubmitButton', function(name, value, attrs){
		return _pjt.invoke('Input', "submit", name, value, attrs);
	});
})(window.Pjt);