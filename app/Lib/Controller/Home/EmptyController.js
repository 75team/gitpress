module.exports = Controller(function(){
    return {
    	__call: function(){
    		this.redirect('/');
    	}
    }
});