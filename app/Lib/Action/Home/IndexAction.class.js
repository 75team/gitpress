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

            var repo = host.replace(".gitpress.org", '').split('.');

            if(repo.length == 1){
                repo.unshift('blog');
            }

            var press = new GitPress(repo[1], repo[0]);

            var post = this.param('p');

            press.init().then(function(res){
                return press.getContents(post);
            })
            .then(function(res){
                var contents = [];
                var promises = [];

                if(!(res instanceof Array)){
                    res = [res];
                }

                for(var i = 0; i < res.length; i++){
                    var blob = res[i];
                    if(blob.type == 'markdown'){
                        var content = blob.content.replace(/^(#+)?(.*)\n/, '$1 <a href="/~'
                            + blob.path + '">$2</a>');
                        promises.push(press.markdown(content));
                    }else if(blob.type == 'code'){

                        promises.push(press.markdown('### [' + 
                            blob.name + '](' +
                            blob.url +')\n```\n' + blob.content + '\n```'));
                    }else{
                        var defer = when.defer();
                        defer.resolve(blob.content);
                        promises.push(defer.promise);
                    }
                }
                when.all(promises).then(function(res){
                    self.assign('contents', res);
                    self.assign('host', host);
                    self.display(); 
                    //self.end(res);
                }).otherwise(function(err){
                    console.log(err);
                })
            })
            .otherwise(function(err){
                console.log(err);
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