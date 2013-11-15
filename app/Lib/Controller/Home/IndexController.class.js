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
            
            var press = new GitPress(host);

            var post = this.param('p'), page = this.param('pn') || 1;

            press.init().then(function(res){
                return press.getContents(post, page);
            })
            .then(function(res){

                var contents = [];
                var template = press.options.template,
                    perpage = press.options.perpage;
                
                var hasNext = res.length > perpage;
                res = res.slice(0, perpage);

                for(var i = 0; i < res.length; i++){
                    if(!post){
                        var parts = res[i].html.split(/\n\n\n\n/);
                        contents.push(parts[0]);

                        if(parts.length > 1){
                            contents.push('[<a href="/~' + res[i].path + '">...</a>]');
                        }
                    }else{
                        contents.push(res[i].html);
                    }
                }
                if(contents.length){

                    self.assign('contents', contents);
                    self.assign('host', host);
                    self.assign('title', press.options.title);
                    self.assign('user', press.options.user);
                    self.assign('repo', press.options.repo);
                    self.assign('post', post);
                    self.assign('pageID', press.options.user + '/' 
                        + press.options.repo + '/' + (post || 'index'));
                    self.assign('template', template);
                    self.assign('page', page);
                    self.assign('hasNext', hasNext);

                    self.assign('q', '');

                    self.assign('friends', press.options.friends);

                    self.display(template); 
                }else{
                    self.end(
                        {"code":404,"message":"{\"message\":\"Not Found\",\"documentation_url\":\"http://developer.github.com/v3\"}"}
                    );
                }
            })
            .otherwise(function(err){
                self.end(err);
            });
        },
        rssAction: function(){
            var host = this.http.hostname;

            var self = this;
            var GitPress = think_require("GitpressModel");
            
            var press = new GitPress(host);

            var RSS = require('rss');

            press.init().then(function(res){
                //console.log(post);
                return press.getContents();
            })
            .then(function(res){
                //console.log(res, press.options);

                var options = press.options;

                /* lets create an rss feed */
                var feed = new RSS({
                    title: options.title,
                    description: options.description,
                    feed_url: host + '/index/rss',
                    site_url: host,
                    author: options.user,
                    categories: options.docs,
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
                self.end(xml);

            }).otherwise(function(err){
                self.end(err);
            });

        },
        searchAction: function(){
            var q = this.param('q');

            var host = this.http.hostname;

            var self = this;
            var GitPress = think_require("GitpressModel");
            
            var press = new GitPress(host);

            var post = null, page = this.param('pn') || 1;

            press.init().then(function(res){
                //console.log(post);
                return press.findContents(post, q, page);
            })
            .then(function(res){

                var contents = [];
                var template = press.options.template,
                    perpage = press.options.perpage;
                
                var hasNext = res.length > perpage;
                res = res.slice(0, perpage);

                for(var i = 0; i < res.length; i++){
                    if(!post){
                        var parts = res[i].html.split(/\n\n\n\n/);
                        contents.push(parts[0]);

                        if(parts.length > 1){
                            contents.push('[<a href="/~' + res[i].path + '">...</a>]');
                        }
                    }else{
                        contents.push(res[i].html);
                    }
                }
                if(!contents.length){
                    shint = '<div class="search-result-hint">Sorry, I found nothing :(</div>';
                }else{
                    shint = 
                        '<div class="search-result-hint">Search result for : ' + q + '</div>';
                }
            
                    
                self.assign('contents', contents);
                self.assign('host', host);
                self.assign('title', press.options.title);
                self.assign('user', press.options.user);
                self.assign('repo', press.options.repo);
                self.assign('post', null);
                self.assign('template', template);
                self.assign('page', page);
                self.assign('hasNext', hasNext);

                self.assign('q', q);
                self.assign('friends', press.options.friends);

                self.display(template); 

            })
            .otherwise(function(err){
                self.end(err);
            });
            //this.end("hello, akira!");
        }
    }
});