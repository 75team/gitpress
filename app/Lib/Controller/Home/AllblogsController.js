var fs = require('fs');

module.exports = Controller(function(){
	return {
		indexAction: function(){
			var root = __dirname + '/../../Model/cache/';
			var res = [] , files = fs.readdirSync(root);
			//this.end('allblogs');
			files.forEach(function(file){
 				var pathname = root + '/' + file
      				, stat = fs.lstatSync(pathname);

      			if (stat.isDirectory()){
      				var gitpress_conf = pathname + '/gitpress.json';
      				if(fs.existsSync(gitpress_conf)){
      					if(file != 'gitpress.akira-cn'){
      						var press = file.replace(/^blog./,'');
      						res.push('<a href="http://' + press + '.gitpress.org">' + press + '</a>');
      					}
      				}
      			}				
			});
			//console.log(this.http);
			this.header('content-type', 'text/html;charset=utf8');

			var title = "<h1>以下站点内容与gitpress官方无关，只是服务器上的记录，不保证完全能正常访问</h1>";
			
			this.end(title + "<ul><li>" + res.join('</li><li>') + "</li></ul>");
		}
	};
});