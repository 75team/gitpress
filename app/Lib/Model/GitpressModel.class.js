//github api
'use strict'
var when = require('when');

var GitHubApi = require('github');
var github = new GitHubApi({
	// required
	version: "3.0.0",
	// optional
	timeout: 5000,
	//debug: true
});

var mixin = require('node-mixin');

var fs = require('fs');

var client_id = '5283e94694c3f4d149a7', 
	client_secret = '4e32758f32e1e5b23ee4672ddf1861f51729c11f';

//console.log(__dirname);

function parseRepo(host){
	if(/gitpress.org$/.test(host)){
	    if(host == 'gitpress.org' || host == 'www.gitpress.org'){
	        host = 'gitpress.akira-cn.gitpress.org';
	    }

	    var repo = host.replace(".gitpress.org", '').split('.');

	    if(repo.length == 1){
	        repo.unshift('blog');
	    }

	    if(repo.length > 2){
	    	repo[0] = repo.slice(0, -1).join('.');
	    	repo[1] = repo[repo.length - 1];
	    }

	    if(repo[1] == 'ququ'){
	        repo[1] = 'qgy18';
	    }

	    return {user:repo[1], repo:repo[0]}; 	
	}else{
		var domainFile = __dirname + '/cache/domains.rec';

		if(fs.existsSync(domainFile)){
			var map = fs.readFileSync(domainFile, {encoding: 'utf-8'});
			map = JSON.parse(map);
			
			//console.log(map, host, map[host]);

			if(map[host]){
				return {user: map[host].user, repo: map[host].repo};
			}else{
				return {user:'akira-cn', repo:'gitpress'};
			}
		}else{
			return {user:'akira-cn', repo:'gitpress'};
		}
	}
}

function GitPress(user, repo){
	process.umask(0);

	if(arguments.length == 1){
		var info = parseRepo(user);
		user = info.user;
		repo = info.repo;
	}

	this.options = {
		user: user,
		repo: repo,
		cache: __dirname + '/cache/' + repo + '.' + user
	}
}

var defaultConf = {
	"docs"      : ["README.md", "README.markdown", "README"],	
	"perpage"   : 10,
	"types"     : {
		"\\.(md||markdown)$"   : "markdown", 
		"\\.(js||css||json)$"  : "code",
		"\\.html?$"            : "html",
		".*"                   : "text"		
	},
	//domain_alias:  ["your.domain"],
	//friends   :   [{name, title, url}],
	//"title"		: "[default is project name]",
	"comment"	: "on",
	"template"	: "default",
	"order"		: "~text"    //number、text
};

GitPress.prototype.init = function(){
	var self = this,
		cache = self.options.cache;

	if(!fs.existsSync(__dirname + '/cache')){
		fs.mkdirSync(__dirname + '/cache');
	}

	if(!fs.existsSync(cache)){
		fs.mkdirSync(cache);
	}


	var reposFile = cache + '/.repos';
	if(fs.existsSync(reposFile)){
		var reposLog = fs.readFileSync(reposFile, {encoding: 'utf-8'}); 
		reposLog = JSON.parse(reposLog);

		if(Date.now() - reposLog.timeStamp < 144000){
			self.options.update = reposLog.data.updated_at;
		}
		//console.log('from cache-->');
	}

	var deferred = when.defer();
	if(!self.options.update){
		github.repos.get({
			user: self.options.user,
			repo: self.options.repo 
		}, function(err, res){
			if(!err){
				self.options.update = res.updated_at;
				
				self.options.description = res.description;
				self.options.title = res.name;

				fs.writeFile(reposFile, 
					JSON.stringify({data:res, timeStamp: Date.now()}), 
					{mode: 438});	

				deferred.resolve();
			}else{
				deferred.reject(err);
			}		
		});
	}else{
		self.options.description = reposLog.data.description;
		self.options.title = reposLog.data.name;
		
		deferred.resolve();
	}

	return deferred.promise.then(function(){
		return self.getContent('gitpress.json').then(function(res){
			var content = (new Function("return " + res.content))();
			
			//get tpl
			mixin(self.options, content, true);
			mixin(self.options, defaultConf);

			var domains = self.options["domain-alias"] 
				|| self.options["domain_alias"];

			if(domains){
				var map = {};
				var domainFile = __dirname + '/cache/domains.rec';

				if(fs.existsSync(domainFile)){
					map = fs.readFileSync(domainFile, {encoding: 'utf-8'});
					map = JSON.parse(map);
				}

				//domain-alias [domain1, ~domain2]
				var user = self.options.user, repo = self.options.repo;

				for(var i = 0; i < domains.length; i++){
					var domain = domains[i];

					if(domain.charAt(0) == '~'){
						//for delete
						domain = domain.slice(1);
						if(domain in map && map[domain].user == user
							&& map[domain].repo == repo){
							delete map[domain];
						}						
					}else{
						if(!(domain in map)){
							map[domain] = {user: self.options.user,
								repo: self.options.repo};
						}
					}
				}

				fs.writeFile(domainFile, 
					JSON.stringify(map), 
					{mode: 438});
			}
			//console.log(self.options);

			return self.options;	
		});
	});
}

GitPress.prototype.markdown = function(text) {
	var deferred = when.defer(),
		self = this;

	github.markdown.render({text:text}, function(err, res){
		if(res){
			deferred.resolve(res.data);
		}else{
			deferred.reject(err);
		}
	});	

	return deferred.promise;
}

GitPress.prototype.getContent = function(path, sha) {
	var deferred = when.defer(),
		self = this;

	//use filecache

	var cacheFile = this.options.cache + '/' + encodeURIComponent(path);
	//console.log(path);
	try{
		if(fs.existsSync(cacheFile)){
			var content = fs.readFileSync(cacheFile, {encoding: 'utf-8'});
			content = JSON.parse(content);

			if(sha && content.data.sha == sha
				|| content.update == self.options.update){
				//console.log(content.data);
				deferred.resolve(content.data);
				return deferred.promise;
			}
		}	
	}catch(ex){}

	github.repos.getContent({
		user: this.options.user,
		repo: this.options.repo,
		path: path
	}, function(err, res){
		if(err){
			deferred.reject(err);
		}else{
			res.timeStamp = Date.now();

			if(res.type == 'file'){

				var content = new Buffer(res.content, 'base64').toString();
				var type = getType(self.options.types, res.name);
				//res.type = type;
				res.content = content;	

				if(type == 'markdown'){
					//console.log(content);

					content = res.content.replace(/^(#+)?\s*(.*)/, '$1 <a href="/~'
						+ res.path + '">$2</a>');

					//console.log(content);

					res.title = RegExp.$2;
					
					self.markdown(content)
						.then(function(html){
							res.html = html;

							fs.writeFile(cacheFile, 
								JSON.stringify({data:res, update: self.options.update}), 
								{mode: 438});

							deferred.resolve(res);
					});

				}else if(type == 'code'){
					res.title = res.name;

					self.markdown('### [' + 
						res.name + '](' +
						res.url +')\n```\n' + res.content + '\n```')
						.then(function(html){
							res.html = html;
			
							fs.writeFile(cacheFile, 
								JSON.stringify({data:res, update: self.options.update}), 
								{mode: 438});

							deferred.resolve(res);
						});
				}else{
					res.html = res.content;

					res.title = res.name;

					fs.writeFile(cacheFile, 
						JSON.stringify({data:res, update: self.options.update}), 
						{mode: 438});

					deferred.resolve(res);
				}	
			}else{
				fs.writeFile(cacheFile, 
					JSON.stringify({data:res, update: self.options.update}), 
					{mode: 438});

				deferred.resolve(res);				
			}
		}
	});

	return deferred.promise;
}

GitPress.prototype.getList = function(docs){

	var deferred = when.defer();

	docs = docs || this.options.docs;
	
	var ret = [], promises = [], blob_promises = [];
	var self = this;

	for(var i = 0; i < docs.length; i++){
		var doc = docs[i];
		promises.push(self.getContent(doc));
	}

	when.settle(promises).then(function(list){
		for(var i = 0; i < list.length; i++){
			var res = list[i];
			if(res.state == 'fulfilled'){
				var doc = res.value;

				if(doc instanceof Array){
					for(var j = 0; j < doc.length; j++){
						var blob = doc[j];

						if(blob.type == 'file'){
							blob_promises.push(
								self.getContent(blob.path, blob.sha)
							);
						}
					}
				}else if(doc.type == 'file'){
					ret.push(doc);
				}
			}

		}

		if(blob_promises.length){
			when.all(blob_promises).then(function(list){
				ret.push.apply(ret, list);
				deferred.resolve(ret);
			}).otherwise(function(err){
				deferred.reject(err);
			});
		}else{
			deferred.resolve(ret);
		}
		
	}).otherwise(function(err){
		deferred.reject(err);
	});
	
	return deferred.promise;	
}

function getType(types, name){
	for(var type in types){
		var reg = new RegExp(type);
		if(reg.test(name)){
			return types[type];
		}
	}
}

GitPress.prototype.findContents = function(docs, words, page){
	words = words.split(/\s+/);

	if(docs && !(docs instanceof Array)){
		docs = [docs];
	}

	page = page || 1;

	var perpage = this.options.perpage,
		self = this;

	return this.getList(docs).then(function(list){
		var res = [];

		for(var i = 0; i < list.length; i++){
			var blob = list[i];
			if(blob.type){
				for(var j = 0; j < words.length; j++){
					if(blob.content.indexOf(words[j]) >= 0){
						res.push({
							sha:  blob.sha,
							type: blob.type, 
							name: blob.name,
							path: blob.path,
							url: blob.html_url,
							content: blob.content,
							html: blob.html,
							title: blob.title
						});
					}
				}
			}
		}

		res.sort(function(a,b){
			var aa = a.name, bb = b.name,
				order = self.options.order || "~text",
				desc = false;

			if(order.indexOf("~") == 0){
				desc = true;
				order = order.slice(1);
			}

			if(order == 'number'){
				aa = parseInt(aa) || 0;
				bb = parseInt(bb) || 0;
			}

			return (aa < bb)^desc ? -1 : 1
		});

		return res.slice((page - 1) * perpage, page * perpage + 1);
	});
}

GitPress.prototype.getContents = function(docs, page){
	if(docs && !(docs instanceof Array)){
		docs = [docs];
	}

	page = page || 1;

	var perpage = this.options.perpage,
		self = this;

	return this.getList(docs).then(function(list){
		var res = [];

		for(var i = 0; i < list.length; i++){
			var blob = list[i];
			if(blob.type){
				res.push({
					sha:  blob.sha,
					type: blob.type, 
					name: blob.name,
					path: blob.path,
					url: blob.html_url,
					content: blob.content,
					html: blob.html,
					title: blob.title
				});
			}
		}

		res.sort(function(a,b){
			var aa = a.name, bb = b.name,
				order = self.options.order || "~text",
				desc = false;

			if(order.indexOf("~") == 0){
				desc = true;
				order = order.slice(1);
			}

			if(order == 'number'){
				aa = parseInt(aa) || 0;
				bb = parseInt(bb) || 0;
			}

			return (aa < bb)^desc ? -1 : 1
		});

		return res.slice((page - 1) * perpage, page * perpage + 1);
	});
}

//hack http send
var _send = github.httpSend;

github.httpSend = function(msg, block, callback){
	
	block.url += block.url.indexOf('?') > -1 ? '&' : '?';
	block.url += 'client_id=' + client_id + '&client_secret=' + client_secret;

	//console.log(block.method, block);

	return _send.apply(github, arguments);
}

module.exports = GitPress;

//var press = new GitPress('akira-cn', 'blog');

/*press.markdown("abc\n<!--more-->\ndef").then(function(res){
	console.log(res.split(/\n\n\n\n/));
}).otherwise(function(err){
	console.log(err);
});*/

/*press.getContent('posts/2013-11-12-my-first-blog.md').then(function(res){
	console.log(res);
}).otherwise(function(err){
	console.log(err);
});*/

/*press.init().then(function(res){
	//console.log(res);
	return press.getContents('posts/2013-11-12-my-first-blog.md');
})
.then(function(res){
	console.log(res);
})
.otherwise(function(err){
	console.log(err);
});*/