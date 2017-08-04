/*!
pithy.teemplate.htmlhelper.js
by anlige @ 2017-08-04
*/

;
(function(_pjt) {
	if (!_pjt) {
		throw 'Exception: Pjt is not found!';
	}

	/*
	* @description	format template with the follow arguments
	* @param	template	: template text
	*/
	function format(template) {
		var args = Array.prototype.slice.call(arguments, 1);
		if (args.length <= 0) return template;
		return template.replace(/\{(\d+?)\}/g, function($0, $1) {
			var val = args[parseInt($1)];
			if (val === undefined) return "";
			return val;
		});
	}

	/*
	* @description	generate properties
	* @param	attrs	: properties
	*/
	var parseattrs = function(attrs) {
		attrs = attrs || {};
		var ret = "";
		for (var i in attrs) {
			if (!attrs.hasOwnProperty(i)) continue;
			ret += format(" {0}=\"{1}\"", i, attrs[i]);
		}
		return ret;
	}
	/*
	* @description	generate common input tag
	* @param	type	: input type (text, password, radio, checkbox .....)
	* @param	name	: input name
	* @param	value	: value
	* @param	attrs	: properties
	*/
	var input = function(type, name, value, attrs) {
		var input = "<input type=\"" + type + "\"";
		if (name) input += " name=\"" + name + "\"";
		if (value) input += " value=\"" + value + "\"";
		input += parseattrs(attrs);
		return input + " />";
	};
	
	/*
	* @description	generate select tag
	* @param	name	: select name
	* @param	list	: values
	* @param	selectedIndex	:  index selected
	* @param	attrs	: properties
	*/
	var dropdownlist = function(name, list, selectedIndex, attrs) {
		selectedIndex = selectedIndex || 0;
		var select = "<select name=\"" + name + "\"" + parseattrs(attrs) + ">";
		var index = 0;
		if (list.length !== undefined) {
			for (var i = 0; i < list.length; i++) {
				select += format("<option value=\"{0}\"{2}>{1}</option>", list[i], list[i], selectedIndex == i ? " selected=\"selected\"" : "");
			}
		} else {
			for (var i in list) {
				if (!list.hasOwnProperty(i)) continue;
				select += format("<option value=\"{0}\"{2}>{1}</option>", i, list[i], selectedIndex == index ? " selected=\"selected\"" : "");
				index++;
			}
		}
		return select + "</select>";
	};

	/*
	* @description	generate a link
	* @param	title	: link text
	* @param	url	: link target url
	* @param	attrs	: properties
	*/
	_pjt.register('ActionLink', function(title, url, attrs) {
		return format("<a href=\"{0}\"{1}>{2}</a>", url, parseattrs(attrs), title);
	});

	/*
	* @description	generate normal form 
	* @param	name	: form name
	* @param	action	: form action to submit
	* @param	method	: submit method
	* @param	attrs	: properties
	*/
	_pjt.register('Form', function(name, action, method, attrs) {
		return format("<form name=\"{2}\" action=\"{0}\"{1} method=\"{3}\">", action, parseattrs(attrs), name, method || "GET");
	});

	/*
	* @description	generate upload form 
	* @param	name	: form name
	* @param	action	: form action to submit
	* @param	attrs	: properties
	* @return	xxx
	*/
	_pjt.register('FormUpload', function(name, action, attrs) {
		return format("<form name=\"{2}\" action=\"{0}\"{1} method=\"POST\" enctype=\"multipart/form-data\">", action, parseattrs(attrs), name);
	});

	/*
	* @description	generate form end tag
	*/
	_pjt.register('FormEnd', function() {
		return "</form>";
	});

	
	/*
	* @description	generate common input tag
	*/
	_pjt.register('Input', input);

	/*
	* @description	generate checkbox input tag
	* @param	name	: input name
	* @param	value	: value
	* @param	attrs	: properties
	*/
	_pjt.register('CheckBox', function(name, value, attrs) {
		return input("checkbox", name, value, attrs);
	});

	/*
	* @description	generate dropdown select tag
	*/
	_pjt.register('DropDownList', dropdownlist);

	/*
	* @description	generate multiple select tag
	* @param	name	: select name
	* @param	list	: values
	* @param	selectedIndex	:  index selected
	* @param	attrs	: properties
	*/
	_pjt.register('ListBox', function(name, list, selectedIndex, attrs) {
		attrs = attrs || {};
		attrs["multiple"] = "multiple";
		return dropdownlist(name, list, selectedIndex, attrs);
	});

	/*
	* @description	generate hidden input tag
	* @param	name	: input name
	* @param	value	: value
	*/
	_pjt.register('Hidden', function(name, value) {
		return input("hidden", name, value);
	});

	/*
	* @description	generate password input tag
	* @param	name	: input name
	* @param	value	: value
	* @param	attrs	: properties
	*/
	_pjt.register('Password', function(name, value, attrs) {
		return input("password", name, value, attrs);
	});

	/*
	* @description	generate radio input tag
	* @param	name	: input name
	* @param	value	: value
	* @param	attrs	: properties
	*/
	_pjt.register('RadioButton', function(name, value, attrs) {
		return input("radio", name, value, attrs);
	});

	/*
	* @description	generate textarea tag
	* @param	name	: input name
	* @param	value	: value
	* @param	attrs	: properties
	*/
	_pjt.register('TextArea', function(name, value, attrs) {
		return format("<textarea name=\"{0}\"{2}>{1}</textarea>", name, value, parseattrs(attrs));
	});

	/*
	* @description	generate textbox input tag
	* @param	name	: input name
	* @param	value	: value
	* @param	attrs	: properties
	*/
	_pjt.register('TextBox', function(name, value, attrs) {
		return input("text", name, value, attrs);
	});

	/*
	* @description	generate button
	* @param	name	: button name
	* @param	value	: display text
	* @param	attrs	: properties
	*/
	_pjt.register('Button', function(name, value, attrs) {
		return input("button", name, value, attrs);
	});

	/*
	* @description	generate reset button
	* @param	name	: button name
	* @param	value	: display text
	* @param	attrs	: properties
	*/
	_pjt.register('ResetButton', function(name, value, attrs) {
		return input("reset", name, value, attrs);
	});

	/*
	* @description	generate submit button
	* @param	name	: button name
	* @param	value	: display text
	* @param	attrs	: properties
	*/
	_pjt.register('SubmitButton', function(name, value, attrs) {
		return input("submit", name, value, attrs);
	});
})(window.Pjt);