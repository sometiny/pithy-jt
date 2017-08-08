/*!
demo
*/
;(function(){

	function __initlize(){
		var ele = id('nav-list');
		if(!ele){
			return;
		}
		ele.innerHTML = 
		'<a href="../index.html">在线测试工具</a> '+
		'<a href="index.html">基本示例</a> '+
		'<a href="htmlhelper.html">PjtHtmlhelper</a> '+
		'<a href="extends.html">PjtExtends</a> ' +
		'<a href="htmltag.html">Html标签模式的模板兼容扩展</a>';
	}
	
	on(window, 'load', __initlize);
})();