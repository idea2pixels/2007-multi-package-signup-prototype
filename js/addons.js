var Addons = Class.create({
	initialize: function(id){
		this.ps = $(id);
		this.buttons = this.ps.select("div.button_modify");
		this.opts = this.ps.select("div.options");
		this.optsList = this._createOptsObjects();
		this.isAnimating == false;
		this._hideOnLoad();
		this._addEventHandlers();
		this.cart = new ToyCart("features");
	},
	
	_addEventHandlers: function(){
		this.ps.observe("click", this._handleClicks.bindAsEventListener(this));
		$('button_checkout').observe("click", function(){
			var windowArray = window.location.href.substr(7).split("/")
			var locationString = "file://";
			for(i=0; i<(windowArray.length-1); i++){
				locationString += windowArray[i];
				locationString += "/"
			}
			locationString += "checkout.html";
			window.location.href = locationString + this.cart.serializeCart();
		}.bindAsEventListener(this));
	},
	
	_collapse: function(el){
		if(this.isAnimating) return false;
		var opt = this._getOpt(el);
		var options = {
            scaleFrom: 100,
            scaleContent: false,
            transition: Effect.Transitions.easeInOutQuint,
            scaleMode: {
                originalHeight: opt.height,
                originalWidth: opt.width
            },
            scaleX: false,
            scaleY: true,
			beforeStart: function(){ this.isAnimating = true; }.bind(this),
			afterFinish: function(){ el.hide(); this.isAnimating = false; }.bind(this)
        };
		new Effect.Scale(el, 0, options);
	},
	
	_createOptsObjects: function(){
		var optsList = new Array();
		for(var i=0; i<this.opts.length; i++){
			var obj = {
				element: this.opts[i],
				height: this.opts[i].getHeight(),
				width: this.opts[i].getWidth()
			}
			optsList.push(obj);
		}
		return optsList;
	},
	
	_expand: function(el){
		if(this.isAnimating) return false;
		var opt = this._getOpt(el);
		var options = {
            scaleFrom: 0,
            scaleContent: false,
            transition: Effect.Transitions.easeInOutQuint,
            scaleMode: {
                originalHeight: opt.height,
                originalWidth: opt.width
            },
            scaleX: false,
            scaleY: true,
			beforeStart: function(){ this.isAnimating = true; }.bind(this),
			afterFinish: function(){ this.isAnimating = false; }.bind(this)
        };
		el.show();
		new Effect.Scale(el, 100, options);
	},
	
	_getOpt: function(optEl){
		for(var i=0; i<this.opts.length; i++){
			if(optEl === this.opts[i]){
				return this.optsList[i]
			}
		}
		return false;
	},
	
	_handleClicks: function(e){
		var el = e.element();
		if((el.tagName.toLowerCase() == "a") && (el.getAttribute("rel").indexOf("capture") > -1)){
			e.stop();
		}
		if(el.hasClassName("button_modify")){
			this._expand(el.next('div.options'));
		} else if(el.up(2).hasClassName("options")){
			this._selectOption(el)
		}
	},
	
	_hideOnLoad: function(){
		this.opts.each(function(opt){
			opt.setStyle({height: 0});
			opt.hide();
		});
	},
	
	_selectOption: function(selectedOption){
		var optionText = selectedOption.firstChild.cloneNode(false);
		selectedOption.up(2).previous("div.currentselection").update().appendChild(optionText);
		this.cart.addFeature(selectedOption.identify());
		this._collapse(selectedOption.up(2));
	}
	
});

var addon
document.observe("dom:loaded", function(){
	addon = new Addons('packagelist');
});