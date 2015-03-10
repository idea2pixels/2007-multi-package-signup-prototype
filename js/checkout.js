/*
Author: Justin Scott
Date: 12/8/2007
purpose: Dealer Site Checkout
dev notes: 'continue' serializes the cart data
and adds the amounts updating the cart totals

 */
var Checkout = Class.create(
{
	initialize: function(id){
		this.form = $(id);
		this.cart = new ToyCart("modules");
		this._addEventHandlers();
	},
	
	
	_addEventHandlers: function(){
		if($('continue')){
			$('continue').observe("click", function(){
				var windowArray = window.location.href.substr(7).split("/")
			var locationString = "file://";
			for(i=0; i<(windowArray.length-1); i++){
				locationString += windowArray[i];
				locationString += "/"
			}
			locationString += "confirmation.html";
			locationString += this.cart.serializeCart();
			locationString += "&";
			locationString += Form.serializeElements(this.form.select('input.serialize'));
			window.location.href = locationString
			}.bindAsEventListener(this));
		}
	},
	
});

var co;
document.observe("dom:loaded", function()
{
	co = new Checkout('checkoutform');
});
										

