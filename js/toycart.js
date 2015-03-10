/*
 Author: Justin Scott
 Date: 12/14/2007
 dev notes:
 the inline cart/static cart controls.
 leverages serialized data from 'continue' click events
 most all continue logic for package selection and calcuation
 */
var ToyCart = Class.create({
	
	initialize: function(pageId){
		if(pageId == undefined) return;
		this.pageId = pageId;
	
		this.packages = this._createPackages();
		this.modules = this._createModules();
		this.features = this._createFeatures();
		
		this.cart = new Array();
		
		this.monthlyItems = $("monthlyitems");
		this.oneTimeItems = $("onetime");
		this.bill = $('bill');
		
		if(window.location.search.length > 1){
			this.requestParams = window.location.search.split("?")[1].split("&");
			this.unserializeCart();
		}
	
	},
	
	addPackage: function(num){
		num--;
		var cur = this.packages[num];
		this.addToCart(cur);
		this.renderCart();
		this.recalc();
	},
	
	addModule: function(num){
		var cur = this.modules[num-1];
		if(cur.depend != undefined){
			var dependencies = cur.depend.toArray();
			dependencies.each(function(itemIndex){
				this.addToCart(this.modules[itemIndex-1]);					   
			}.bind(this));
		}
		this.addToCart(cur);
		this.renderCart();
		this.recalc();
	},
	
	addFeature: function(id){
		var featPair = id.split("-");
		this.removeFeatureWithPrefix(featPair[0]);
		this.features.each(function(feature, i){
			if(feature.id == id){
				this.addToCart(feature);
				$break;
			}
		}.bind(this));
		this.renderCart();
		this.recalc();
	},
	
	addFeatureByIndex: function(num){
		var cur = this.features[num-1];
		this.addToCart(cur);
		this.renderCart();
		this.recalc();	
	},
	
	renderCart: function(){
		this.monthlyItems.update();
		this.oneTimeItems.update();
		this.cart.each(function(item){
			var name = new Element("span").update(item.name);
			var li = new Element("li").update("$"+item.price).insert({top: name});
			this.monthlyItems.insert({bottom: li});
			if(item.oneTime != undefined){
				var otname = new Element("span").update(item.oTN);
				var otli = new Element("li").update("$"+item.oneTime).insert({top: otname});
				this.oneTimeItems.insert({bottom: otli});
			}
		}.bind(this));
	},
	
	removeModule: function(num){
		num--;
		var cur = this.modules[num];
		if(cur.inCart){
			this.removeFromCart(cur);
			this.renderCart();
			this.recalc();
		}
	},
	
	removeFeatureWithPrefix: function(prefix){
		this.cart.each(function(item){
			if(item.id != undefined){
				if(item.id.split("-")[0] == prefix){
					this.removeFromCart(item);
				}
			}
		}.bind(this));
	},
	
	addToCart: function(obj){
		if(obj.inCart == false){
			obj.inCart = true;
			this.cart.push(obj);
		}
	},
	
	removeFromCart: function(obj){
		this.cart = this.cart.without(obj);
		obj.inCart = false;
	},
	
	recalc: function(){
		var totalM = 0;
		var totalO = 0;
		this.cart.each(function(item){
			totalM += item.price;
			if(item.oneTime){
				totalO += item.oneTime;
			}
		});
		
		this.monthlyItems.insert({bottom: "<li class=\"total\"><span>Your monthly recurring total:</span> $" + totalM+"</li>"});
		this.oneTimeItems.insert({bottom: "<li class=\"total\"><span>Total One-Time Costs:</span> $" + totalO+"</li>"});
		this.bill.update("Total: $"+ (totalM+totalO));
		
	},
	
	serializeCart: function(){
		var qString = "?package=";
		this.packages.each(function(item, i){
			if(item.inCart){
				qString+=(i+1)
			}
		}.bind(this));
		qString += "&modules=";
		this.modules.each(function(item, i){
			if(item.inCart){
				qString+=(i+1);
			}
		}.bind(this));
		qString += "&features=";
		this.features.each(function(item, i){
			if(item.inCart){
				qString+= ((i+1)+",");
			}	
		}.bind(this));
		return qString;
	},
	
	unserializeCart: function(){
		this.requestParams.each(function(item){
			var kv = item.split("=");
			if(kv[0] == "package"){
				var ids = kv[1].toArray();
				ids.each(function(index){
					this.addPackage(index);
				}.bind(this));
			}
			if(kv[0] == "modules"){
				var ids = kv[1].toArray();
				ids.each(function(index){
					this.addModule(index);
				}.bind(this));
			}
			if(kv[0] == "features"){
				var ids = kv[1].split(",");
				ids.each(function(index){
					if(index != "")
					this.addFeatureByIndex(index);
				}.bind(this));
			}
		}.bind(this))
	},
	
	_createPackages: function(){
		var packages = new Array();
		packages.push({ name: "Complete Package", price: 2499, inCart: false });
		packages.push({ name: "Enhanced Package", price: 999, inCart: false });
		packages.push({ name: "Starter Package", price: 500, inCart: false });
		return packages;
	},
	
	_createModules: function(){
		var modules = new Array();
		modules.push({ name: "Used Vehicle Merchandising Module", price: 475, inCart: false});
		modules.push({ name: "Dealership Merchandising Module", price: 475, inCart: false});
		modules.push({ name: "Leaderboards", price: 475, oneTime: 165, oTN: "Leaderboard Design",  inCart: false, depend: "12"});
		return modules;
	},
	
	_createFeatures: function(){
		var features = new Array();
		features.push({ id: "1-1", name: "Spotlight PowerPacks (5)", price: 500, inCart: false});
		features.push({ id: "1-2", name: "Spotlight PowerPacks (10)", price: 1000, inCart: false});
		features.push({ id: "2-1", name: "5 Spotlights", price: 500, inCart: false});
		features.push({ id: "2-2", name: "10 Spotlights", price: 1000, inCart: false});
		features.push({ id: "3-1", name: "FastAds Package", price: 500, inCart: false});
		features.push({ id: "4-1", name: "Complete Package (AutoMercado)", price: 500, inCart: false});
		features.push({ id: "4-2", name: "Enhanced Package (AutoMercado)", price: 1000, inCart: false});
		features.push({ id: "4-3", name: "Starter Package (AutoMercado)", price: 1500, inCart: false});
		return features;
	},
});