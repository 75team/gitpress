## Git Press +

[Git Press +](http://www.gitpress.org) is a light weight tool to build and manage your blogs or your documents quite easier with [github](https://www.github.com) 

All the things you need to do is setting up a configure file named 'gitpress.json' on your github project. (If you let the gitpress.json empty, please make sure there is a README.md file in your project.)

When created gitpress.json, use http://repo.user.gitpress.org to visit your gitpress site and you will see what you want to see. :-)

*example file: github.json*

```json
{
	"docs"      : ["posts"],
	"template"	: "default",	
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

