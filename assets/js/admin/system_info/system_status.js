jQuery(function(r){return r("#generate-report").on("click",function(){var e;return e=[],r.each(system_data,function(r,t){return e.push(t)}),r("#report-for-support").html(e.join("\n")),r("#report-for-support").slideDown(1e3),r("#report-for-support").removeClass("hidden"),r(this).slideUp(1e3)})});