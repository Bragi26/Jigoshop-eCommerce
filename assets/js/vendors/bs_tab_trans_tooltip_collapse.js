+function(n){"use strict";function t(){var n=document.createElement("bootstrap"),t={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var i in t)if(void 0!==n.style[i])return{end:t[i]};return!1}n.fn.emulateTransitionEnd=function(t){var i=!1,r=this;n(this).one(n.support.transition.end,function(){i=!0});var o=function(){i||n(r).trigger(n.support.transition.end)};return setTimeout(o,t),this},n(function(){n.support.transition=t()})}(jQuery);
+function(t){"use strict";var a=function(a){this.element=t(a)};a.prototype.show=function(){var a=this.element,e=a.closest("ul:not(.dropdown-menu)"),n=a.data("target");if(n||(n=a.attr("href"),n=n&&n.replace(/.*(?=#[^\s]*$)/,"")),!a.parent("li").hasClass("active")){var i=e.find(".active:last a")[0],s=t.Event("show.bs.tab",{relatedTarget:i});if(a.trigger(s),!s.isDefaultPrevented()){var o=t(n);this.activate(a.parent("li"),e),this.activate(o,o.parent(),function(){a.trigger({type:"shown.bs.tab",relatedTarget:i})})}}},a.prototype.activate=function(a,e,n){function i(){s.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),a.addClass("active"),o?(a[0].offsetWidth,a.addClass("in")):a.removeClass("fade"),a.parent(".dropdown-menu")&&a.closest("li.dropdown").addClass("active"),n&&n()}var s=e.find("> .active"),o=n&&t.support.transition&&s.hasClass("fade");o?s.one(t.support.transition.end,i).emulateTransitionEnd(150):i(),s.removeClass("in")};var e=t.fn.tab;t.fn.tab=function(e){return this.each(function(){var n=t(this),i=n.data("bs.tab");i||n.data("bs.tab",i=new a(this)),"string"==typeof e&&i[e]()})},t.fn.tab.Constructor=a,t.fn.tab.noConflict=function(){return t.fn.tab=e,this},t(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(a){a.preventDefault(),t(this).tab("show")})}(jQuery);
+function(t){"use strict";var e=function(t,e){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",t,e)};e.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},e.prototype.init=function(e,i,o){this.enabled=!0,this.type=e,this.$element=t(i),this.options=this.getOptions(o);for(var n=this.options.trigger.split(" "),s=n.length;s--;){var r=n[s];if("click"==r)this.$element.on("click."+this.type,this.options.selector,t.proxy(this.toggle,this));else if("manual"!=r){var a="hover"==r?"mouseenter":"focusin",p="hover"==r?"mouseleave":"focusout";this.$element.on(a+"."+this.type,this.options.selector,t.proxy(this.enter,this)),this.$element.on(p+"."+this.type,this.options.selector,t.proxy(this.leave,this))}}this.options.selector?this._options=t.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},e.prototype.getDefaults=function(){return e.DEFAULTS},e.prototype.getOptions=function(e){return e=t.extend({},this.getDefaults(),this.$element.data(),e),e.delay&&"number"==typeof e.delay&&(e.delay={show:e.delay,hide:e.delay}),e},e.prototype.getDelegateOptions=function(){var e={},i=this.getDefaults();return this._options&&t.each(this._options,function(t,o){i[t]!=o&&(e[t]=o)}),e},e.prototype.enter=function(e){var i=e instanceof this.constructor?e:t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(i.timeout),i.hoverState="in",i.options.delay&&i.options.delay.show?void(i.timeout=setTimeout(function(){"in"==i.hoverState&&i.show()},i.options.delay.show)):i.show()},e.prototype.leave=function(e){var i=e instanceof this.constructor?e:t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(i.timeout),i.hoverState="out",i.options.delay&&i.options.delay.hide?void(i.timeout=setTimeout(function(){"out"==i.hoverState&&i.hide()},i.options.delay.hide)):i.hide()},e.prototype.show=function(){var e=t.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){if(this.$element.trigger(e),e.isDefaultPrevented())return;var i=this,o=this.tip();this.setContent(),this.options.animation&&o.addClass("fade");var n="function"==typeof this.options.placement?this.options.placement.call(this,o[0],this.$element[0]):this.options.placement,s=/\s?auto?\s?/i,r=s.test(n);r&&(n=n.replace(s,"")||"top"),o.detach().css({top:0,left:0,display:"block"}).addClass(n),this.options.container?o.appendTo(this.options.container):o.insertAfter(this.$element);var a=this.getPosition(),p=o[0].offsetWidth,h=o[0].offsetHeight;if(r){var l=this.$element.parent(),f=n,u=document.documentElement.scrollTop||document.body.scrollTop,d="body"==this.options.container?window.innerWidth:l.outerWidth(),c="body"==this.options.container?window.innerHeight:l.outerHeight(),y="body"==this.options.container?0:l.offset().left;n="bottom"==n&&a.top+a.height+h-u>c?"top":"top"==n&&a.top-u-h<0?"bottom":"right"==n&&a.right+p>d?"left":"left"==n&&a.left-p<y?"right":n,o.removeClass(f).addClass(n)}var g=this.getCalculatedOffset(n,a,p,h);this.applyPlacement(g,n),this.hoverState=null;var m=function(){i.$element.trigger("shown.bs."+i.type)};t.support.transition&&this.$tip.hasClass("fade")?o.one(t.support.transition.end,m).emulateTransitionEnd(150):m()}},e.prototype.applyPlacement=function(e,i){var o,n=this.tip(),s=n[0].offsetWidth,r=n[0].offsetHeight,a=parseInt(n.css("margin-top"),10),p=parseInt(n.css("margin-left"),10);isNaN(a)&&(a=0),isNaN(p)&&(p=0),e.top=e.top+a,e.left=e.left+p,t.offset.setOffset(n[0],t.extend({using:function(t){n.css({top:Math.round(t.top),left:Math.round(t.left)})}},e),0),n.addClass("in");var h=n[0].offsetWidth,l=n[0].offsetHeight;if("top"==i&&l!=r&&(o=!0,e.top=e.top+r-l),/bottom|top/.test(i)){var f=0;e.left<0&&(f=-2*e.left,e.left=0,n.offset(e),h=n[0].offsetWidth,l=n[0].offsetHeight),this.replaceArrow(f-s+h,h,"left")}else this.replaceArrow(l-r,l,"top");o&&n.offset(e)},e.prototype.replaceArrow=function(t,e,i){this.arrow().css(i,t?50*(1-t/e)+"%":"")},e.prototype.setContent=function(){var t=this.tip(),e=this.getTitle();t.find(".tooltip-inner")[this.options.html?"html":"text"](e),t.removeClass("fade in top bottom left right")},e.prototype.hide=function(){function e(){"in"!=i.hoverState&&o.detach(),i.$element.trigger("hidden.bs."+i.type)}var i=this,o=this.tip(),n=t.Event("hide.bs."+this.type);return this.$element.trigger(n),n.isDefaultPrevented()?void 0:(o.removeClass("in"),t.support.transition&&this.$tip.hasClass("fade")?o.one(t.support.transition.end,e).emulateTransitionEnd(150):e(),this.hoverState=null,this)},e.prototype.fixTitle=function(){var t=this.$element;(t.attr("title")||"string"!=typeof t.attr("data-original-title"))&&t.attr("data-original-title",t.attr("title")||"").attr("title","")},e.prototype.hasContent=function(){return this.getTitle()},e.prototype.getPosition=function(){var e=this.$element[0];return t.extend({},"function"==typeof e.getBoundingClientRect?e.getBoundingClientRect():{width:e.offsetWidth,height:e.offsetHeight},this.$element.offset())},e.prototype.getCalculatedOffset=function(t,e,i,o){return"bottom"==t?{top:e.top+e.height,left:e.left+e.width/2-i/2}:"top"==t?{top:e.top-o,left:e.left+e.width/2-i/2}:"left"==t?{top:e.top+e.height/2-o/2,left:e.left-i}:{top:e.top+e.height/2-o/2,left:e.left+e.width}},e.prototype.getTitle=function(){var t,e=this.$element,i=this.options;return t=e.attr("data-original-title")||("function"==typeof i.title?i.title.call(e[0]):i.title)},e.prototype.tip=function(){return this.$tip=this.$tip||t(this.options.template)},e.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},e.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},e.prototype.enable=function(){this.enabled=!0},e.prototype.disable=function(){this.enabled=!1},e.prototype.toggleEnabled=function(){this.enabled=!this.enabled},e.prototype.toggle=function(e){var i=e?t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;i.tip().hasClass("in")?i.leave(i):i.enter(i)},e.prototype.destroy=function(){clearTimeout(this.timeout),this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var i=t.fn.tooltip;t.fn.tooltip=function(i){return this.each(function(){var o=t(this),n=o.data("bs.tooltip"),s="object"==typeof i&&i;(n||"destroy"!=i)&&(n||o.data("bs.tooltip",n=new e(this,s)),"string"==typeof i&&n[i]())})},t.fn.tooltip.Constructor=e,t.fn.tooltip.noConflict=function(){return t.fn.tooltip=i,this}}(jQuery);
+function(t){"use strict";var e=function(s,n){this.$element=t(s),this.options=t.extend({},e.DEFAULTS,n),this.transitioning=null,this.options.parent&&(this.$parent=t(this.options.parent)),this.options.toggle&&this.toggle()};e.DEFAULTS={toggle:!0},e.prototype.dimension=function(){var t=this.$element.hasClass("width");return t?"width":"height"},e.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var e=t.Event("show.bs.collapse");if(this.$element.trigger(e),!e.isDefaultPrevented()){var s=this.$parent&&this.$parent.find("> .panel > .in");if(s&&s.length){var n=s.data("bs.collapse");if(n&&n.transitioning)return;s.collapse("hide"),n||s.data("bs.collapse",null)}var i=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[i](0),this.transitioning=1;var a=function(){this.$element.removeClass("collapsing").addClass("collapse in")[i]("auto"),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!t.support.transition)return a.call(this);var l=t.camelCase(["scroll",i].join("-"));this.$element.one(t.support.transition.end,t.proxy(a,this)).emulateTransitionEnd(350)[i](this.$element[0][l])}}},e.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var e=t.Event("hide.bs.collapse");if(this.$element.trigger(e),!e.isDefaultPrevented()){var s=this.dimension();this.$element[s](this.$element[s]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var n=function(){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return t.support.transition?void this.$element[s](0).one(t.support.transition.end,t.proxy(n,this)).emulateTransitionEnd(350):n.call(this)}}},e.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var s=t.fn.collapse;t.fn.collapse=function(s){return this.each(function(){var n=t(this),i=n.data("bs.collapse"),a=t.extend({},e.DEFAULTS,n.data(),"object"==typeof s&&s);!i&&a.toggle&&"show"==s&&(s=!s),i||n.data("bs.collapse",i=new e(this,a)),"string"==typeof s&&i[s]()})},t.fn.collapse.Constructor=e,t.fn.collapse.noConflict=function(){return t.fn.collapse=s,this},t(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(e){var s,n=t(this),i=n.attr("data-target")||e.preventDefault()||(s=n.attr("href"))&&s.replace(/.*(?=#[^\s]+$)/,""),a=t(i),l=a.data("bs.collapse"),o=l?"toggle":n.data(),r=n.attr("data-parent"),h=r&&t(r);l&&l.transitioning||(h&&h.find('[data-toggle=collapse][data-parent="'+r+'"]').not(n).addClass("collapsed"),n[a.hasClass("in")?"addClass":"removeClass"]("collapsed")),a.collapse(o)})}(jQuery);