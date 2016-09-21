var AdminProduct,bind=function(t,e){return function(){return t.apply(e,arguments)}},hasProp={}.hasOwnProperty,indexOf=[].indexOf||function(t){for(var e=0,r=this.length;r>e;e++)if(e in this&&this[e]===t)return e;return-1};AdminProduct=function(){function t(t){this.params=t,this.addAttachment=bind(this.addAttachment,this),this.initAttachments=bind(this.initAttachments,this),this.updateAttachments=bind(this.updateAttachments,this),this.removeAttribute=bind(this.removeAttribute,this),this.updateAttribute=bind(this.updateAttribute,this),this.addAttribute=bind(this.addAttribute,this),this.changeProductType=bind(this.changeProductType,this),jQuery("#add-attribute").on("click",this.addAttribute),jQuery("#new-attribute").on("change",function(t){var e;return e=jQuery("#new-attribute-label"),"-1"===jQuery(t.target).val()?(e.closest(".form-group").css("display","inline-block"),e.fadeIn()):e.fadeOut()}),jQuery("#product-attributes").on("click",".show-variation",function(t){var e;return e=jQuery(t.target),jQuery(".list-group-item-text",e.closest("li")).slideToggle(function(){return jQuery("span",e).toggleClass("glyphicon-collapse-down").toggleClass("glyphicon-collapse-up")})}),jQuery("#product-attributes").on("change","input, select",this.updateAttribute).on("click",".remove-attribute",this.removeAttribute).sortable({axis:"y"}),jQuery("#product-type").on("change",this.changeProductType),jQuery(".jigoshop_product_data a").on("click",function(t){return t.preventDefault(),jQuery(this).tab("show")}),jQuery("#stock-manage").on("change",function(){return jQuery(this).is(":checked")?(jQuery(".stock-status_field").slideUp(),jQuery(".stock-status").slideDown()):(jQuery(".stock-status_field").slideDown(),jQuery(".stock-status").slideUp())}),jQuery(".stock-status_field .not-active").show(),jQuery("#sales-enabled").on("change",function(){return jQuery(this).is(":checked")?jQuery(".schedule").slideDown():jQuery(".schedule").slideUp()}),jQuery("#is_taxable").on("change",function(){return jQuery(this).is(":checked")?jQuery(".tax_classes_field").slideDown():jQuery(".tax_classes_field").slideUp()}),jQuery(".tax_classes_field .not-active").show(),jQuery("#sales-from").datepicker({todayBtn:"linked",autoclose:!0}),jQuery("#sales-to").datepicker({todayBtn:"linked",autoclose:!0}),jQuery(".add-product-attachments").on("click",this.updateAttachments),jQuery(document).ready(this.initAttachments)}return t.prototype.params={i18n:{saved:"",confirm_remove:"",attribute_removed:"",invalid_attribute:"",attribute_without_label:""},menu:{},attachments:{}},t.prototype.wpMedia=!1,t.prototype.changeProductType=function(t){var e,r,a,i;a=jQuery(t.target).val(),jQuery(".jigoshop_product_data li").hide(),e=this.params.menu;for(r in e)hasProp.call(e,r)&&(i=e[r],(i===!0||indexOf.call(i,a)>=0)&&jQuery(".jigoshop_product_data li."+r).show());return jQuery(".jigoshop_product_data li:first a").tab("show")},t.prototype.addAttribute=function(t){var e,r,a,i,s;return t.preventDefault(),a=jQuery("#product-attributes"),e=jQuery("#new-attribute"),r=jQuery("#new-attribute-label"),s=parseInt(e.val()),i=r.val(),0>s&&-1!==s?void jigoshop.addMessage("warning",this.params.i18n.invalid_attribute):-1===s&&0===i.length?void jigoshop.addMessage("danger",this.params.i18n.attribute_without_label,6e3):(e.select2("val",""),r.val("").slideUp(),s>0&&jQuery("option[value="+s+"]",e).attr("disabled","disabled"),jQuery.ajax({url:jigoshop.getAjaxUrl(),type:"post",dataType:"json",data:{action:"jigoshop.admin.product.save_attribute",product_id:a.closest(".jigoshop").data("id"),attribute_id:s,attribute_label:i}}).done(function(t){return null!=t.success&&t.success?(jQuery(t.html).hide().appendTo(a).slideDown(),a.trigger("add-attribute")):jigoshop.addMessage("danger",t.error,6e3)}))},t.prototype.updateAttribute=function(t){var e,r,a,i,s,o,n,u,d,l,c;for(e=jQuery("#product-attributes"),r=jQuery(t.target).closest("li.list-group-item"),o=jQuery(".values input[type=checkbox]:checked",r).toArray(),o.length?s=o.reduce(function(t,e){return e.value+"|"+t},""):(s=jQuery(".values select",r).val(),void 0===s&&(s=jQuery(".values input",r).val())),a=function(t){return"checkbox"===t.type||"radio"===t.type?t.checked:t.value},d={},l=jQuery(".options input.attribute-options",r).toArray(),i=0,n=l.length;n>i;i++)u=l[i],c=/(?:^|\s)product\[attributes]\[\d+]\[(.*?)](?:\s|$)/g.exec(u.name),d[c[1]]=a(u);return jQuery.ajax({url:jigoshop.getAjaxUrl(),type:"post",dataType:"json",data:{action:"jigoshop.admin.product.save_attribute",product_id:e.closest(".jigoshop").data("id"),attribute_id:r.data("id"),value:s,options:d}}).done(function(t){return function(e){return null!=e.success&&e.success?jigoshop.addMessage("success",t.params.i18n.saved,2e3):jigoshop.addMessage("danger",e.error,6e3)}}(this))},t.prototype.removeAttribute=function(t){var e;return t.preventDefault(),confirm(this.params.i18n.confirm_remove)?(e=jQuery(t.target).closest("li"),jQuery("option[value="+e.data("id")+"]",jQuery("#new-attribute")).removeAttr("disabled"),jQuery.ajax({url:jigoshop.getAjaxUrl(),type:"post",dataType:"json",data:{action:"jigoshop.admin.product.remove_attribute",product_id:e.closest(".jigoshop").data("id"),attribute_id:e.data("id")}}).done(function(t){return function(r){return null!=r.success&&r.success?(e.slideUp(function(){return e.remove()}),jigoshop.addMessage("success",t.params.i18n.attribute_removed,2e3)):jigoshop.addMessage("danger",r.error,6e3)}}(this))):void 0},t.prototype.updateAttachments=function(t){var e,r;return t.preventDefault(),e=jQuery(t.target).data("type"),r?void this.wpMedia.open():(this.wpMedia=wp.media({states:[new wp.media.controller.Library({filterable:"all",multiple:!0})]}),r=this.wpMedia,this.wpMedia.on("select",function(t){return function(){var a,i;return i=r.state().get("selection"),a=jQuery.map(jQuery('input[name="product[attachments]['+e+'][]"]'),function(t){return parseInt(jQuery(t).val())}),i.map(function(r){var i;return r=r.toJSON(),null!=r.id?("gallery"===e?i={template_name:"product-gallery",insert_before:".empty-gallery",attachment_class:".gallery-image"}:"downloads"===e&&(i={template_name:"product-downloads",insert_before:".empty-downloads",attachment_class:".downloads-file"}),t.addAttachment(r,a,i)):void 0})}}(this)),r.open())},t.prototype.initAttachments=function(){var t,e,r,a,i,s,o,n,u;if(null!=this.params.attachments.gallery)for(u=wp.template("product-gallery"),s=this.params.attachments.gallery,e=0,a=s.length;a>e;e++)t=s[e],jQuery(".empty-gallery").before(u(t)),this.addHooks("",jQuery(".gallery-image").last());if(null!=this.params.attachments.downloads){for(u=wp.template("product-downloads"),o=this.params.attachments.downloads,n=[],r=0,i=o.length;i>r;r++)t=o[r],jQuery(".empty-downloads").before(u(t)),n.push(this.addHooks("",jQuery(".downloads-file").last()));return n}},t.prototype.addHooks=function(t,e){var r;return r=jQuery(e).find(".delete"),jQuery(e).hover(function(){return r.show()},function(){return r.hide()}),r.click(function(){return jQuery(e).remove()})},t.prototype.addAttachment=function(t,e,r){var a,i;return t.id&&-1===jQuery.inArray(t.id,e)?(i=wp.template(r.template_name),a=i({id:t.id,url:t.sizes&&t.sizes.thumbnail?t.sizes.thumbnail.url:t.url,title:t.title}),jQuery(r.insert_before).before(a),this.addHooks("",jQuery(r.attachment_class).last())):void 0},t}(),jQuery(function(){return new AdminProduct(jigoshop_admin_product)});