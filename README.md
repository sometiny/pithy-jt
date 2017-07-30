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
var pjt = new Pjt();

///模板编译
var code = pjt.compile(res);

///渲染数据
id('result2').innerHTML = pjt.render(code, data);
```

###借助helper(链式写法)
```javascript
PjtHelper.compile(res).render(data).appendTo('result');
```
appendTo方法把渲染后的数据赋值给result标签。

###借助helper(非链式写法)
```javascript
///编译
var render = PjtHelper.compile(res);

///渲染
var appender = render.render(data);
id('result3').innerHTML = appender;
```
直接把appender赋值给result3标签。


#模板语法类似Razor语法，不过比较宽松
###赋值
```
<div>name = @name</div>
<div>age = @age</div>
<div>4 years later = @(age + 4)</div>
<div>sex = @basic['sex']</div>
<div>works = @basic.works</div>
````
支持基本的表达式，必要情况下可以使用“()”来作为表达式界定符

###代码块
```
@{
	var r = 255, g = 0, b = 0;
}
<div style="color:rgb(@r, @g, @b)">color:rgb(@r, @g, @b)</div>
```

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