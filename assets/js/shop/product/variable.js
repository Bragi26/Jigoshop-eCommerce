var ProductVariable,bind=function(t,e){return function(){return t.apply(e,arguments)}},hasProp={}.hasOwnProperty;ProductVariable=function(){function t(t){this.params=t,this.updateAttributes=bind(this.updateAttributes,this),jQuery("select.product-attribute").on("change",this.updateAttributes)}return t.prototype.VARIATION_EXISTS=1,t.prototype.VARIATION_NOT_EXISTS=2,t.prototype.VARIATION_NOT_FULL=3,t.prototype.params={variations:{}},t.prototype.attributes={},t.prototype.updateAttributes=function(t){var e,r,i,a,s,u,o,n,p,I,h;e=jQuery("#add-to-cart-buttons"),r=jQuery("#add-to-cart-messages"),I=/(?:^|\s)attributes\[(\d+)](?:\s|$)/g.exec(t.target.name),this.attributes[I[1]]=t.target.value,o=this.VARIATION_NOT_FULL,h=Object.keys(this.attributes).length,n=this.params.variations;for(u in n)if(hasProp.call(n,u))if(s=n[u],o=this.VARIATION_EXISTS,Object.keys(s.attributes).length===h){p=this.attributes;for(i in p)if(hasProp.call(p,i)&&(a=p[i],""!==s.attributes[i]&&s.attributes[i]!==a)){o=this.VARIATION_NOT_EXISTS;break}if(o===this.VARIATION_EXISTS){if(!s.price){o=this.VARIATION_NOT_EXISTS;continue}jQuery("p.price > span",e).html(s.html.price),jQuery("#variation-id").val(u),e.slideDown(),r.slideUp();break}}else o=this.VARIATION_NOT_FULL;return o!==this.VARIATION_EXISTS&&(jQuery("#variation-id").val(""),e.slideUp()),o===this.VARIATION_NOT_EXISTS?r.slideDown():void 0},t}(),jQuery(function(){return new ProductVariable(jigoshop_product_variable)});