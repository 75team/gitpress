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

module.exports = Action(function(){
    return {
        /*init: function(){
            this.super("init");
        },*/
        getRepo: function(){
            var host = this.http.req.headers.host;

            if(host == 'gitpress.org'){
                host = 'gitpress.akira-cn.gitpress.org';
            }

            var repo = host.replace(".gitpress.org", '').split('.');

            if(repo.length == 1){
                repo.unshift('blog');
            }

            return {user:repo[1], repo:repo[0]};            
        },
        indexAction: function(){
            //repos.user.gitpress.org
            var repo = this.getRepo(), host = this.http.req.headers.host;

            var self = this;
            var GitPress = think_require("GitpressModel");
            
            var press = new GitPress(repo.user, repo.repo);

            var post = this.param('p'), page = this.param('page');

            press.init().then(function(res){
                //console.log(post);
                return press.getContents(post, page);
            })
            .then(function(res){
                var contents = [];
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
                    self.assign('user', repo.user);
                    self.assign('repo', repo.repo);
                    self.assign('pageID', host + '/' + (post || 'index'));
                    self.display(); 
                }else{
                    self.end(
                        {"code":404,"message":"{\"message\":\"Not Found\",\"documentation_url\":\"http://developer.github.com/v3\"}"}
                    );
                }
            })
            .otherwise(function(err){
                self.end(err);
            });

            //console.log(press);
            //this.assign("title", "hello");
            //this.display(); //render Home/index_index.html file
        },
        rssAction: function(){
            var repo = this.getRepo(), host = this.http.req.headers.host;

            var self = this;
            var GitPress = think_require("GitpressModel");
            
            var press = new GitPress(repo.user, repo.repo);

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
        testAction: function(){
            this.end("hello, akira!");
        }
    }
});