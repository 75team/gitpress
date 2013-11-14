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
        }*/
        indexAction: function(){

            var self = this;
            var GitPress = think_require("GitpressModel");

            //repos.user.gitpress.org
            var host = this.http.req.headers.host;

            if(host == 'gitpress.org'){
                host = 'blog.akira-cn.gitpress.org';
            }
            
            var repo = host.replace(".gitpress.org", '').split('.');

            if(repo.length == 1){
                repo.unshift('blog');
            }

            var press = new GitPress(repo[1], repo[0]);

            var post = this.param('p'), page = this.param('page');

            press.init().then(function(res){
                //console.log(post);
                return press.getContents(post, page);
            })
            .then(function(res){
                //console.log(res);
                var contents = [];
                for(var i = 0; i < res.length; i++){
                    if(!post){
                        var parts = res[i].html.split(/\n\n\n\n/);
                        contents.push(parts[0]);

                        if(parts.length > 1){
                            contents.push('<br/><a href="/~' + res[i].path + '">继续阅读 &gt</a>');
                        }
                    }else{
                        contents.push(res[i].html);
                    }
                }
                self.assign('contents', contents);
                self.assign('host', host);
                self.assign('title', press.options.title);
                self.display(); 
            })
            .otherwise(function(err){
                self.end(err);
            });

            //console.log(press);
            //this.assign("title", "hello");
            //this.display(); //render Home/index_index.html file
        },
        testAction: function(){
            this.end("hello, akira!");
        }
    }
});