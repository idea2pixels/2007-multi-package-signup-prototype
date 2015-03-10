/*
Author: Justin Scott
Date: 12/14/2007
dev notes:
comments inline
 */

var PackageSelection = Class.create(
{
	initialize: function(id){
		this.ps = $(id);
		
		this.cart = new ToyCart("modules");
		//initialize buttons and UI actions
		this.buttonSets = this.ps.select('ul.moreinfobuttons');
		this.packages = this.ps.select('div.packagecontents');		
		this._hideOnLoad();
		this._createButtonSetObjects();
		this._createPackageObjects();
		this.isAnimating = false;
		this._addEventHandlers();
		this._hideHeights();
	},
	//activate show/hide for alternative content
	_activateContent: function(buttonIndex, packageIndex){
		var packageDetails = this.packages[packageIndex].select("div.packagecontentstube");
		for(var i=0; i<packageDetails.length; i++){
			if(i==buttonIndex){
				packageDetails[i].show();
			} else {
				packageDetails[i].hide();
			}
		}
	},

	//dynamically add and remove active classes
	_activateButton: function(buttonSet, buttonIndex){
		var buttons = buttonSet.element.select("li");
		for(var i=0; i<buttons.length; i++){
			if(buttonIndex == i){
				buttons[i].addClassName("active");
				buttons[i].removeClassName("inactive");
			} else {
				buttons[i].removeClassName("active");
				buttons[i].addClassName("inactive");
			}
		}
	},
	//setup listener to start the serialize cart function 'continue'
	_addEventHandlers: function(){
		this.ps.observe("click", this._handleClicks.bindAsEventListener(this));
		if($('continue')){
			$('continue').observe("click", function(){
				var windowArray = window.location.href.substr(7).split("/")
			var locationString = "file://";
			for(i=0; i<(windowArray.length-1); i++){
				locationString += windowArray[i];
				locationString += "/"
			}
			locationString += "features.html";
			window.location.href = locationString + this.cart.serializeCart();
			}.bindAsEventListener(this));
		}
	},

	//animation of contract data to slide DOWN and hide
	_contract: function(el, cb){
		if(this.isAnimating) return false;
		if(!cb){
			cb = function(){};
		}
		var options = {
            scaleFrom: 100,
            scaleContent: false,
            transition: Effect.Transitions.easeInOutQuint,
            scaleMode: {
                originalHeight: this.packageList[this._getPackageIndex(el)].height,
                originalWidth: el.getWidth()
            },
            scaleX: false,
            scaleY: true,
			beforeStart: function(){ this.isAnimating = true; }.bind(this),
			afterFinish: function(){ el.hide(); this.isAnimating = false; cb(); }.bind(this)
        };
		new Effect.Scale(el, 0, options);
	},

	//button bind dependencies
	_createButtonSetObjects: function(){
		this.buttonSetList = new Array();
		for(var i=0; i<this.buttonSets.length; i++){
			var obj = {
				element: this.buttonSets[i],
				current: 0,
				expanded: false
			}
			this.buttonSetList.push(obj);
		}
	},

	//create package objects to show in slide menu
	_createPackageObjects: function(){
		this.packageList = new Array();
		for(var i=0; i<this.packages.length; i++){
			var obj = {
				element: this.packages[i],
				expanded: false,
				current: 0,
				details: false, 
				height: this.packages[i].getHeight()
			}
			this.packageList.push(obj);
		}
	},

	//animation of contract data to slide UP and show
	_expand: function(el){
		if(this.isAnimating) return false;
		el.show();
		var options = {
            scaleFrom: 0,
            scaleContent: false,
            transition: Effect.Transitions.easeInOutQuint,
            scaleMode: {
                originalHeight: this.packageList[this._getPackageIndex(el)].height,
                originalWidth: el.getWidth()
            },
            scaleX: false,
            scaleY: true,
			beforeStart: function(){ this.isAnimating = true; }.bind(this),
			afterFinish: function(){ this.isAnimating = false; }.bind(this)
        };
		new Effect.Scale(el, 100, options);
	},
	//group sets for dynamic content
	_getButtonSet: function(button){
		var bs = button.up();
		for(var i=0; i<this.buttonSets.length; i++){
			if(bs === this.buttonSets[i]){
				return this.buttonSetList[i];
			}
		}
		return -1;
	},
	//which button was pushed?
	_getButtonIndex: function(button, buttonSet){
		var buttons = buttonSet.element.select("li");
		for(var i=0; i<buttons.length; i++){
			if(button === buttons[i]){
				return i;
			}
		}
		return -1;
	},
	//what package goes with the button?
	_getPackage: function(packageEl){
		for(var i=0; i<this.packages.length; i++){
			if(packageEl === this.packages[i]){
				return this.packageList[i];
			}
		}
		return -1;
	},
	//get the package
	_getPackageIndex: function(package){
		for(var i=0; i<this.packages.length; i++){
			if(package === this.packages[i]){
				return i;
			}
		}
		return -1;
	},
	//activate package content
	_handleButton: function(el){
		if(this.isAnimating) return false;
		var bs = this._getButtonSet(el);
		var buttonIndex = this._getButtonIndex(el, bs);
		var packageIndex = this._getPackageIndex(el.up().next());
		var package = this._getPackage(el.up().next());
		if(bs.expanded){
			if(el.hasClassName("active")){
				this._toggle(el.up().next(), this._resetButtons.bind(this, bs));
				bs.expanded = false;
			} else {
				this._activateContent(buttonIndex, packageIndex);
				this._activateButton(bs, buttonIndex);
				if(package.details){
					this._hideDetail(package.element.select("div.shownDetail").reduce());
				}
			}
		} else {			
			this._activateContent(buttonIndex, packageIndex);
			this._activateButton(bs, buttonIndex);
			this._toggle(el.up().next());
			bs.expanded = true;
		}	
	},
	//simple click handler
	_handleClicks: function(e){
		var el = e.element();
		if((el.tagName.toLowerCase() == "a") && (el.getAttribute("rel"))){
			if((el.getAttribute("rel").indexOf("capture") > -1)){
				e.stop();
			}
		}
		if((el.tagName.toLowerCase() == "li") && (el.up().hasClassName("moreinfobuttons"))){
			this._handleButton(el);
		}
		if((el.tagName.toLowerCase() == "a" && (el.next()))){
			if(el.next().hasClassName("test")){
				this._showDetail(el.up());	
			}
		}
		if(el.up()){
			if(el.up().hasClassName("button_add"))
				this._toggleAddButton(el.up());
		}
	},
	//hide package details
	_hideDetail: function(toHide){
		this._getPackage(toHide.up()).details = false;
		//toHide.hide();
		new Effect.Move(toHide, {
								y: (toHide.getHeight()-20),
								transition: Effect.Transitions.easeInBack,
								duration: 0.85,
								afterFinish: function(){ toHide.remove() }.bind(this)});	
	},
	//element management
	_maxHeight: function(elements){
		var mHeight = 0;
		var cHeight = 0;
		for(var i=0; i<elements.length; i++){
			cHeight = elements[i].getHeight();
			if(cHeight > mHeight){
				mHeight = cHeight;
			}
		}
		return mHeight;
	},
	//event management for loading state
	_hideOnLoad: function(){
		for(var i=0; i<this.packages.length; i++){
			var detailItems = this.packages[i].select("div.packagecontentstube");
			var equalHeight = this._maxHeight(detailItems);
			for(var j=0; j<detailItems.length; j++){
				detailItems[j].setStyle({height: equalHeight + "px"});
				if(j>0)
					detailItems[j].hide();
			}
			this.packages[i].hide();
		}
	},
	//reset/hide
	_hideHeights: function(){
		for(var i=0; i<this.packages.length; i++){
			this.packages[i].setStyle({height: 0});
		}	
	},
	//reset
	_resetButtons: function(buttonSet){
		var buttons = buttonSet.element.select('li');
		buttons.each(function(button){
			button.removeClassName("active");
			button.removeClassName("inactive");
		});
	},
	//show package details
	_showDetail: function(el){
		if(this.isAnimating) return false;
		var package = this._getPackage(el.up().up().up());
		package.details = true;
		el = el.down('div.test');
		var toShow = $(el.cloneNode(true)).show().setOpacity(0.85).addClassName("shownDetail");
		
		toShow.observe("click", function(e){ 
			if(e.element().tagName.toLowerCase() != "a")
				this._hideDetail(toShow); 
		}.bindAsEventListener(this));
		
		el.up().up().up().up().appendChild(toShow);
		toShow.setStyle({height: toShow.up().getHeight()-20+"px"});
		new Effect.Move(toShow, {
						mode: 'relative',
						y: -(toShow.getHeight()-20),
						duration: 0.8,
						transition: Effect.Transitions.easeOutBounce,
						beforeStart: function(){ this.isAnimating = true; }.bind(this),
						afterFinish: function(){ this.isAnimating = false; }.bind(this)});
	},
	//simple toggle.
	_toggle: function(el,cb){
		if(!cb){
			cb = function(){};
		}
		if(el.style.display == 'none'){
			this._expand(el);
		} else {
			this._contract(el, cb);
		}
	},
	//simple toggle for package
	_toggleAddButton: function(el){
		var packageIndex = this._getPackageIndex(el.up().next().select("div.packagecontents").reduce());
		if(el.id == "add_leaderboard"){
			this.ps.select("div.button_add").each(function(item){
				if(item.id != "add_leaderboard"){
					item.addClassName("selected");
				}
			});
		}
		
		if(el.hasClassName("selected")){
			el.removeClassName("selected");
			this.cart.removeModule(packageIndex+1);
		} else {
			this.cart.addModule(packageIndex+1);
			el.addClassName("selected");
		}
	}
	
});

var ps;
document.observe("dom:loaded", function()
{
	ps = new PackageSelection('packagelist');
});
										

