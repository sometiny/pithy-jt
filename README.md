#PithyJt
想起razor，手感还不错，写个差不多的东西

没了解过编译原理，简单写了下，支持一些简单的语法检查。

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