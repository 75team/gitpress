/**
 * action
 * @return 
 */

var GitHubApi = require('github');
var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    timeout: 5000
});

var querystring = require('querystring');
var mixin = require('node-mixin');

function QUERY_URL(pathname, param){
    return function queryURL(newParam){
        mixin(param, newParam, true);

        return '/' + pathname + '?' + querystring.stringify(param);
    }
}

module.exports = Controller(function(){
    return {
        /*init: function(){
            this.super("init");
        },*/
        indexAction: function(){
            //repos.user.gitpress.org
            var host = this.http.hostname;
            var self = this;
            var GitPress = think_require("GitpressModel");
            
            //console.log(this.http);

            var press, runServer = !!this.header('proxy-x-gitpress');
            if(runServer){
                var repos = this.header('proxy-x-gitpress').split(',');
                press = new GitPress(repos[0], repos[1]);
            }else{
                press = new GitPress(host);
            }

            var post = this.param('p'), page = this.param('pn') || 1,
                tpl = this.param('tpl');

            if(!tpl && this.header('proxy-x-gitpress-template')){
                tpl = this.header('proxy-x-gitpress-template');
            }

            var category = this.param('c');

            press.init().then(function(res){
                //console.log(press.options);
                if(!runServer && host != press.options.domain){
                    self.redirect("//" + press.options.domain + self.http.req.url, 301);
                    return;
                }

                if(category){
                    return press.getContents(press.options.categories[category] || [], page);
                }
                return press.getContents(post, page);
            })
            .then(function(res){
                if(!res) return;
                var contents = [], files = [];
                var template = tpl || press.options.template,
                    perpage = press.options.perpage;
                
                var hasNext = res.length > perpage;
                res = res.slice(0, perpage);

                for(var i = 0; i < res.length; i++){
                    if(!post){
                        var parts = res[i].html.split(/^\n|<\!--more-->|<hr\/?>/);
                        if(parts.length > 1){
                            parts[0] += '<div class="readmore"><a href="/~' + res[i].path + '">more...</a></div>';
                        }
                        contents.push(parts[0]);
                    }else{
                        contents.push(res[i].html);
                    }
                    files.push(res[i].path);
                }
                if(contents.length){
                    var comment = post && press.options.comment;
                    if(comment === 'on'){
                        comment = {type:'disqus', short_name:'gitpress'};
                    }

                }else{
                    if(category){
                        self.redirect('/');
                        return;
                    }
                    
                    self.http.res.statusCode = 404;
                    comment = false;

                    /*self.end(
                        {"code":404,"message":"{\"message\":\"Not Found\",\"documentation_url\":\"http://developer.github.com/v3\"}"}
                    );*/

                    contents = ['<h1>Error 404 - Not Found</h1><p>There isn\'t a GitPress Page here.</p><p><a href="/">Click here</a> back to the homepage.</p>'];

                    if(!post){
                        contents[0] = '<p>There isn\'t a valid document in this site. Please check the <a href="/~gitpress.json">gitpress.json</a> file. Current <quote>docs</quote> path is <code>'+JSON.stringify(press.options.docs)+'</code>.</p><hr/>' + contents[0];   
                    }

                    files = ['empty_404.html'];
                }

                var data = {
                    resource_url: runServer?'':'http://s.androidzh.com',
                    contents: contents,
                    files: files,
                    host: self.http.host,
                    domain: press.options.domain,
                    title: press.options.title,
                    user: press.options.user,
                    repo: press.options.repo,
                    avatar: press.options.avatar,
                    comment: comment,
                    pageID: press.options.user + '/' 
                        + press.options.repo + '/' + (post || 'index'),
                    template: template,
                    page: page,
                    perpage: perpage,
                    queryURL: QUERY_URL(self.http.pathname, self.http.get),
                    hasNext: hasNext,
                    categories: press.options.categories,
                    categoryCounts: press.options.categoryCounts,
                    category: category,
                    q: '',
                    friends: press.options.friends,
                    description: press.options.description
                };
                self.assign(data);

                self.display(template); 
            })
            .otherwise(function(err){
                console.log(err);
                if(/gitpress.org$/.test(host)){
                    var repo = host.replace(".gitpress.org", '').split('.');
                    if(repo.length == 1){
                        repo.unshift('blog');
                    }
                    //console.log(repo);

                    var data = {
                        user:repo[1], 
                        repo:repo[0],
                        resource_url: runServer?'':'http://s.androidzh.com',
                        template: "default",
                        title: "Oops!",
                        description: "Something was wrong ;-("
                    };

                    self.http.res.statusCode = 500;
                    self.assign(data);

                    self.display('error');                    
                }else{
                    self.end(err.msg);
                }
            });
        },
        rssAction: function(){
            var host = this.http.hostname;

            var self = this;
            var GitPress = think_require("GitpressModel");
            
            var press, runServer = !!this.header('proxy-x-gitpress');
            if(runServer){
                var repos = this.header('proxy-x-gitpress').split(',');
                press = new GitPress(repos[0], repos[1]);
            }else{
                press = new GitPress(host);
            }

            var RSS = require('rss');

            press.init().then(function(res){
                if(!runServer && host != press.options.domain){
                    self.redirect("//" + press.options.domain + self.http.req.url, 301);
                    return;
                }
                return press.getContents();
            })
            .then(function(res){
                //console.log(res, press.options);
                if(!res) return;

                var options = press.options;

                /* lets create an rss feed */
                var feed = new RSS({
                    title: options.title,
                    description: options.description,
                    feed_url: host + '/index/rss',
                    site_url: host,
                    author: options.user,
                    categories: Object.keys(press.options.categories),
                    pubDate: options.update
                });


                for(var i = 0; i < res.length; i++){
                    //console.log(res[i]);
                    var doc = res[i];
                    /* loop over data and add to feed */
                    feed.item({
                        title:  doc.title,
                        description: doc.html,
                        url: host + '/~' + doc.path, // link to the item
                        author: options.user, // optional - defaults to feed author property
                    });
                }


                // cache the xml to send to clients
                var xml = feed.xml();
                self.header('content-type', 'text/xml;charset=utf-8')
                self.end(xml);

            }).otherwise(function(err){
                self.end(err.msg);
            });

        },
        searchAction: function(){
            var q = this.param('q'),
                tpl = this.param('tpl');

            var host = this.http.hostname;

            var self = this;
            var GitPress = think_require("GitpressModel");
            
            var press, runServer = !!this.header('proxy-x-gitpress');
            if(runServer){
                var repos = this.header('proxy-x-gitpress').split(',');
                press = new GitPress(repos[0], repos[1]);
            }else{
                press = new GitPress(host);
            }

            var post = null, page = this.param('pn') || 1;

            press.init().then(function(res){
                if(!runServer && host != press.options.domain){
                    self.redirect("//" + press.options.domain + self.http.req.url, 301);
                    return;
                }
                return press.findContents(post, q, page);
            })
            .then(function(res){
                if(!res) return;

                var contents = [], files = [];
                var template = tpl || press.options.template,
                    perpage = press.options.perpage;
                
                var hasNext = res.length > perpage;
                res = res.slice(0, perpage);

                for(var i = 0; i < res.length; i++){
                    if(!post){
                        var parts = res[i].html.split(/^\n|<\!--more-->|<hr\/?>/);
                        if(parts.length > 1){
                            parts[0] += '<div class="readmore"><a href="/~' + res[i].path + '">more...</a></div>';
                        }
                        contents.push(parts[0]);
                    }else{
                        contents.push(res[i].html);
                    }
                    files.push(res[i].path);
                }
                
                var data = {
                    resource_url: runServer?'':'http://s.androidzh.com',
                    contents: contents,
                    files: files,
                    host: self.http.host,
                    domain: press.options.domain,
                    title: press.options.title,
                    user: press.options.user,
                    repo: press.options.repo,
                    avatar: press.options.avatar,
                    comment: false,
                    template: template,
                    page: page,
                    perpage: perpage,
                    queryURL: QUERY_URL(self.http.pathname, self.http.get),
                    hasNext: hasNext,
                    categories: press.options.categories,
                    categoryCounts: press.options.categoryCounts,
                    category: null,
                    q: q,
                    friends: press.options.friends,
                    description: press.options.description
                };
                    
                self.assign(data);

                self.display(template); 

            })
            .otherwise(function(err){
                console.log(err);
                self.end(err.msg);
            });
            //this.end("hello, akira!");
        }
    }
});