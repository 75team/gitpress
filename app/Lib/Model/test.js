var GitPress = require('./GitpressModel');
var press = new GitPress('koala.guru');

press.init().then(function(res){
    console.log(press.options);
    press.getContents(null, 1).then(function(res){
        console.log(res);
    });
}).otherwise(function(err){
    console.log(err);
})