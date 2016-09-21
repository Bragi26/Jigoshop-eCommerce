var AdvancedSettings,bind=function(e,t){return function(){return e.apply(t,arguments)}};AdvancedSettings=function(){function e(){this.generate=bind(this.generate,this),this.addGroupItem=bind(this.addGroupItem,this),this.keysCount=jQuery("#api-keys li").length,jQuery("#api-keys").on("click",".generate",this.generate),jQuery("#api-keys").on("click",".toggle",this.toggleGroupItem),jQuery("#api-keys").on("click",".remove",this.removeGroupItem),jQuery("#api-keys").on("keyup",".user-id",this.updateListHeader),jQuery("#api-keys").on("click",".add-key",this.addGroupItem)}return e.prototype.keysCount=0,e.prototype.template="",e.prototype.toggleGroupItem=function(e){var t;return t=jQuery(e.target),jQuery(".list-group-item-text",t.closest("li")).slideToggle(function(){return jQuery("span",t).toggleClass("glyphicon-collapse-down").toggleClass("glyphicon-collapse-up")})},e.prototype.removeGroupItem=function(e){return jQuery(e.target).closest(".list-group-item").remove()},e.prototype.addGroupItem=function(e){var t;return e.preventDefault(),t=this.getTemplate(),jQuery("#api-keys .list-group").append(t({id:this.keysCount})),this.keysCount++,jQuery("#api-keys select").last().select2(),jQuery("#api-keys .generate").last().trigger("click")},e.prototype.generate=function(e){var t,r,n;return e.preventDefault(),r=this.generateUniqueId(),n=this.generateHexString(52),t=jQuery(e.target),t.closest("fieldset").find("input.user-id").val(r).trigger("change"),t.closest("fieldset").find("input.key").val(n).trigger("change"),t.closest("li").find(".title").html(r)},e.prototype.generateUniqueId=function(){var e;return e=Math.round(1e10*Math.random()),jQuery("#api-keys .user-id").filter(function(t,r){return parseInt(jQuery(r).val())===e}).length>0&&(e=this.generateUniqueId()),e},e.prototype.generateHexString=function(e){var t;for(t="";t.length<e;)t+=Math.random().toString(16).substring(2);return t.substring(0,e)},e.prototype.updateListHeader=function(e){return jQuery(e.target).closest("li").find(".title").html(jQuery(e.target).val())},e.prototype.getTemplate=function(){return""===this.template&&(this.template=wp.template("api-key")),this.template},e}(),jQuery(function(){return new AdvancedSettings});