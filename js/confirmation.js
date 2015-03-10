/*
Author: Justin Scott
Date: 12/14/2007
dev notes:
function confirms and resets data in cache.
 */

var Confirm = Class.create(
{
	initialize: function(id){
		this.form = $(id);
		this.cart = new ToyCart("confirmation");
		this.kv = window.location.search.split("?")[1].split("&");
		this.unserialize();
	},
	
	unserialize: function(){
		this.kv.each(function(kvp){
			var kvpA = kvp.split("=");
			if($(kvpA[0])){
				kvpA[1] = kvpA[1].gsub("%20", " ").gsub("%40", "@");
				$(kvpA[0]).insert({bottom: kvpA[1]});	
			}
		});
	},
	
});

var co;
document.observe("dom:loaded", function()
{
	co = new Confirm('checkoutform');
});
										

