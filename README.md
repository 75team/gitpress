## gitpress project

gitpress 是一个轻量的github博客自动生成平台

它可以很方便地将你的github项目文档目录建立成博客

你所需要做的事情只是提供一份简单的配置文档 gitpress.json 到你的项目根目录下

文档格式如下：

```js
{
	"docs"      : ["posts"],	
	"perpage"   : 10,
	"types"     : {
		"\\.(md||markdown)$"   : "markdown", 
		"\\.(js||css||json)$"  : "code",
		"\\.html?$"            : "html",
		".*"                   : "text"		
	},
	"title"  : "Akira's Blog",
	"comment"  : "on",
	"friends"  : [
		{
		  "name"  : "github",
		  "title"  : "github",
		  "url"  : "http://github.com"		  
		},
		{
		  "name"  : "gitpress",
		  "title"  : "gitpress",
		  "url"  : "http://gitpress.org"
		}
	] 
}
```

接下来往你的项目的 posts 目录中提交 markdown 文档

用下面的地址访问你的项目文档：

http://项目名.github用户名.gitpress.org
