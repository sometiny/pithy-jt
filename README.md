#PithyJt
Javascript模板引擎，模仿Razor语法，支持一些简单的语法检查，console可定位到语法错误行号。支持缓存，采用Crc32作缓存唯一性校验。  
通过扩展，支持Html元素快捷生成，模板无限级继承。  
不习惯Razor语法，可以通过扩展，使用hmtltag来定义模板。  

#用法
编译模板
```javascript
var codes = Pjt.compile('<h3>@title</h3><p>@description</p>');
```

渲染数据
```javascript
var text = Pjt.render(codes, {
	title : '标题Pjt', 
	description : '描述：一个Razor语法的Javscript模板引擎'
});
```

输出结果：  
```html
<h3>标题Pjt</h3><p>描述：一个Razor语法的Javscript模板引擎</p>
```

#文件结构
```
resources	几个演示代码常用的方法
src	Pjt源码
	pithy.ajax.js	非Pjt必须，一个好用的ajax请求插件
	pithy.teemplate.js	Pjt核心，必须
	pithy.teemplate.helper.js	非Pjt必须，一些方便的快速操作封装
	pithy.teemplate.htmlhelper.js	非Pjt必须，快捷的Html表单元素生成，无需调用任何方法，引用后自动实现
	pithy.teemplate.extends.js	非Pjt必须，实现Pjt继承功能的扩展
	pithy.teemplate.htmltag.js	非Pjt必须，自动实现html标签模板功能的扩展，引用后自动实现，无需调用任何方法
	
demo	简单示例
	extends.html	Pjt继承功能的扩展示例
	htmlhelper.htmlhtml	Html表单元素生成示例
	index.htmlhtml	基本示例
	layouts.htmlhtml	用于extends示例的布局内容
	
index.html	在线编译渲染
```

src目录中的**pithy.teemplate.js**为核心文件，Pjt必须。  
目录中的其他文件均为扩展。  
其中**pithy.ajax.js**是一个简单的ajax请求库，内置了require，可以用来引用AMD规范的模块。  

**pithy.teemplate.*.js**  四个扩展库，可扩展Pjt的功能。可以通过script标签直接引用，也可以用AJAX.require引用。



#示例数据
```javascript
{
	name : 'anlige',
	age : 23,
	list : [
		{date : '1986-9-1', text : 'birthday'},
		{date : '1998-9-1', text : 'schrool'},
		{date : '2009-6-21', text : 'work'}
	],
	basic : {
		sex : 'boy',
		works : 9
	}
}
```

#JavaScript调用方法

###不借助helper
```javascript
///初始化实例

///模板编译
var code = Pjt.compile('<p>@name</p>');

///渲染数据
id('result2').innerHTML = Pjt.render(code, {name : 'Jazor'});
```

###借助helper(链式写法)
```javascript

PjtHelper
	.compile('<p>@name</p>')
	.render({name : 'Jazor'})
	.appendTo('result');
```
appendTo方法把渲染后的数据赋值给result标签。

###借助helper(非链式写法)
```javascript
///编译
var render = PjtHelper.compile('<p>@name</p>');

///渲染
var appender = render.render({name : 'Jazor'});

///赋值
id('result3').innerHTML = appender;
```
直接把appender赋值给result3标签。

###bind方法
```javascript

/*
	PjtHelper.bind(data, src, dest);
	data : 待渲染的数据
	src  : html元素，包含待编译的模板文本
	dest : 	1、html元素, 用来显示渲染结果
			2、回调函数, 第一个参数为渲染结果
*/

PjtHelper.bind({name : 'Jazor'}, '_template', 'result3');

///等效于
PjtHelper.bind({name : 'Jazor'}, '_template', function(res){
	document.getElementById('result3').innerHTML = res;
});
```


#模板语法类似Razor语法，不过比较宽松
###赋值
```
<div>name = @name</div>
<div>age = @age</div>
<div>4 years later = @(age + 4)</div>
<div>sex = @basic['sex']</div>
<div>works = @basic.works</div>
````
 支持基本的表达式，必要情况下可以使用“()”来作为表达式界定符。
 模板中输出@符号，请使用@@。

###代码块
```
@{
	var r = 255, g = 0, b = 0;
}
<div style="color:rgb(@r, @g, @b)">color:rgb(@r, @g, @b)</div>
```
使用@紧跟{作为一个代码块，代码块需要}结束。

###HTML块
```
@region 
<script>
var name = 'anlige';
</script>
@endregion
```
 使用@region标识一个HTML代码块的开始，@endregion之前的所有代码仅仅被当做普通文本行，但参与变量渲染。
 主要用来在模板中引用style或script标签，当然，不建议在模板中引用，模板中尽量只有html标签。

###if语句
```
@if( age > 23){
	<p>大于23岁</p>
}else{
	<p>不大于23岁</p>
}
```

###for语句(原生js)
```
<ul>
@for(var i = 0; i < list.length; i++){
	<li>@list[i].date</li>
}
</ul>
```
###each语句(用于数组)
```
<ul>
@each list as value{
	<li>date =  @value.date</li>
}
</ul>
```
```
<ul>
@each list as key, value{
	<li>key = @key, date =  @value.date</li>
}
</ul>
```
###foreach语句(用于普通js对象，这里就叫键值对对象吧)
```
<ul>
@foreach basic as key, value{
	<li>@key = @value</li>
}
</ul>
```
each和foreach是语法糖，最后是编译成原生js。