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

var client_id = '5283e94694c3f4d149a7', 
	client_secret = '4e32758f32e1e5b23ee4672ddf1861f51729c11f';

function GitPress(user, repo){
	this.options = {
		user: user,
		repo: repo
	}
}

GitPress.prototype.init = function(){
	var self = this;
	return this.getContent('gitpress.json').then(function(res){
		var content = new Buffer(res.content, 'base64').toString();;
		content = (new Function("return "+content))();
		mixin(self.options, content);
		return self.options;	
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

GitPress.prototype.getContent = function(path) {
	var deferred = when.defer(),
		self = this;

	github.repos.getContent({
		user: this.options.user,
		repo: this.options.repo,
		path: path
	}, function(err, res){
		if(err){
			deferred.reject(err);
		}else{
			try{
				deferred.resolve(res);
			}catch(ex){
				deferred.reject(ex);
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
		//deferred.resolve(list);

		for(var i = 0; i < list.length; i++){
			var res = list[i];
			if(res.state == 'fulfilled'){
				var doc = res.value;

				if(doc instanceof Array){
					for(var j = 0; j < doc.length; j++){
						var blob = doc[j];

						if(blob.type == 'file'){
							blob_promises.push(self.getContent(blob.path));
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

GitPress.prototype.getContents = function(docs, page){
	if(docs && !(docs instanceof Array)){
		docs = [docs];
	}

	page = page || 1;

	var perpage = this.options.perpage,
		self = this;

	//console.log(this.options);

	return this.getList(docs).then(function(list){
		var res = [];

		for(var i = 0; i < list.length; i++){
			var blob = list[i];
			var content = new Buffer(blob.content, 'base64').toString();
			var type = getType(self.options.types, blob.name);
			if(type){
				res.push({
					type: type, 
					name: blob.name,
					path: blob.path,
					url: blob.html_url,
					content: content
				});
			}
		}

		res.sort(function(a,b){
			return a.name > b.name ? -1 : 1
		});

		return res.slice((page - 1) * perpage, page * perpage);
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

var press = new GitPress('akira-cn', 'blog');

/*press.markdown("abc").then(function(res){
	console.log(res);
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
	return press.getContents();
})
.then(function(res){
	console.log(res);
})
.otherwise(function(err){
	console.log(err);
});*/