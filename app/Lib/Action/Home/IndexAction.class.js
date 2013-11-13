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
            var conf = C('github_conf');

            github.repos.getContent(conf, function(err, res){
                if(res){
                    //self.end(res);
                    //TODO 分页
                    var contents = [];
                    for(var i = 0; i < res.length; i++){
                        var art = res[i];
                        if(art.type == "file" && 
                            /\.(md|markdown)/.test(art.name)){
                            github.repos.getContent({
                                    user: conf.user,
                                    repo: conf.repo,
                                    path: conf.path + '/' + art.name,
                                }, function(err, res){
                                    if(res){
                                        
                                        var content = new Buffer(res.content, 'base64').toString();
                                        
                                        github.markdown.render({text:content}, function(err, res){
                                            //console.log(res.data);
                                            if(res){
                                                contents.push(res.data);
                                                //self.assign('content', res.data);
                                                //self.display();
                                                //self.end(res.data);
                                                console.log(contents);
                                            }else{
                                                self.error(err);
                                            }
                                        });
                                        
                                    }else{
                                        self.error(err);
                                    }                                  
                                });
                        }
                    }
                }else{
                    self.error(err);
                }
            });
            //this.assign("title", "hello");
            //this.display(); //render Home/index_index.html file
        },
        testAction: function(){
            this.end("hello, akira!");
        }
    }
});