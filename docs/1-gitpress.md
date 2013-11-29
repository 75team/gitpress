## The gitpress.json file

*Example:*

```json
{
	"docs"      : ["posts"],
	"template"	: "default",
	"domain_alias" :  ["your.domain"],	
	"perpage"   : 10,
	"order"  : "number",
	"types"     : {
		"\\.(md||markdown)$"   : "markdown", 
		"\\.(js||css||json)$"  : "code",
		"\\.html?$"            : "html",
		".*"                   : "text"		
	},
	"title"  : "Akira's Blog",
	"description" : "My Blog Description...",
	"comment"  : {"type":"disqus", "short_name":"gitpress"},
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

### *docs*

`docs` property set up a list of files or directories that you can place your documents on.

The default value of this property is `["README.md", "README.markdown", "README"]`

### categoring

You can set the `docs` property in json format:

```json
"docs": {"category1": "path1", "category2": "path2", /*...*/}
```

### *template*

`template` property set the layout of the website, now the valid values of this property are `"default", "slate", "phase", "pithiness" or "tactile"`.

Want to use this property to change your website layout? See: [Setting Website's Layout](~docs/2-website-layouts.md)

### *domain alias*

The default domain of your gitpress site is `http://repo.user.gitpress.org`. You can use your own domain as well. See: [Custom Domains](~docs/3-set-custom-domains.md) 

### *perpage* 

`perpage` property set the maximum count of the documents place on your websit index perpage. The default value is `10`.

### *order*

`order` property defines the rule of your documents sorted. The default value is `~text` means it will be ordered by name as string desc. The other values is `text` `number` and `~number`.

### *types*

`types` property defineds the file type of the documents detected by file name. If you don't want some kind of files place on website, you can set the types of this file a type of `null`.

### *title*

`title` property is the main title of your gitpress site. Default value is equal to your repository title.

### *description*

`description` property is the description of your gitpress site. Default value is equal to your repository description.

### *comment*

You can add comments in your blog or docs. Now it supports [disqus](http://disqus.com) and [duoshuo](http://dev.duoshuo.com/).

### *friends*

`friends` property place the friend links on the sidebar of your site.


