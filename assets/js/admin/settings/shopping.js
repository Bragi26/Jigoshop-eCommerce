var ShoppingSettings;ShoppingSettings=function(){function t(){jQuery("#restrict_selling_locations").on("switchChange.bootstrapSwitch",this.toggleSellingLocations),jQuery("#selling_locations").show().closest("div.form-group").show(),jQuery("#enable_verification_message").on("switchChange.bootstrapSwitch",this.toggleVerificationMessage),jQuery("#verification_message").show().closest("div.form-group").show()}return t.prototype.toggleSellingLocations=function(){return jQuery("#selling_locations").closest("tr").toggle()},t.prototype.toggleVerificationMessage=function(){return jQuery("#verification_message").closest("tr").toggle()},t}(),jQuery(function(){return new ShoppingSettings});