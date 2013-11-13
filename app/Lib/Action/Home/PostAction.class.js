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
            var conf = C('github_conf'),
                art = this.param('art');
            //2013-11-12-my-first-blog.md

            github.repos.getContent({
                    user: conf.user,
                    repo: conf.repo,
                    path: conf.path + '/' + art,
                }, function(err, res){
                    //console.log(err, res);
                    
                    if(res){
                        
                        var content = new Buffer(res.content, 'base64').toString();
                        
                        github.markdown.render({text:content}, function(err, res){
                            //console.log(res.data);
                            if(res){
                                self.assign('content', res.data);
                                self.display();
                                //self.end(res.data);
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
});