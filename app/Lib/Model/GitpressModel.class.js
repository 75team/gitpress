//github api
var when = require('when');

var GitHubApi = require('github');
var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    timeout: 5000
});

var mixin = require('node-mixin');

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

GitPress.prototype.getList = function(){

	var deferred = when.defer();

	var docs = this.options.docs;
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
					//type dir
					//deferred.resolve('ok dir');

					for(var j = 0; j < doc.length; j++){
						var blob = doc[j];

						if(blob.type == 'file'){
							//ret.push(blob);
							blob_promises.push(self.getContent(blob.path));
						}
					}
				}else if(doc.type == 'file'){
					//console.log(doc);
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

GitPress.prototype.getContents = function(page){
	page = page || 1;

	return this.getList().then(function(res){
		return res;
	});
}

module.exports = GitPress;

var press = new GitPress('akira-cn', 'blog');

/*press.getContent('posts/2013-11-12-my-first-blog.md').then(function(res){
	console.log(res);
}).otherwise(function(err){
	console.log(err);
});*/

press.init().then(function(res){
	//console.log(res);
	return press.getContents();
})
.then(function(res){
	console.log(res);
})
.otherwise(function(err){
	console.log(err);
});