sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode"
    ], function (UIComponent, JSONModel, BindingMode) {
    "use strict";

    return UIComponent.extend("com.poc.fiori.Component", {

        metadata: { manifest: "json" },

        init: function () {
        UIComponent.prototype.init.apply(this, arguments);

        var oModel = new JSONModel({
            products: [
            { id:"P001", name:"Laptop Pro 15",      category:"Electronics", price:"1299.99", status:"Available",   stock:"In Stock",     _expanded: false },
            { id:"P002", name:"Wireless Headphones", category:"Accessories", price:"199.99",  status:"Available",   stock:"Low Stock",    _expanded: false },
            { id:"P003", name:"USB-C Hub",           category:"Accessories", price:"49.99",   status:"Discontinued",stock:"Out of Stock", _expanded: false },
            { id:"P004", name:"4K Monitor",          category:"Electronics", price:"599.99",  status:"Available",   stock:"In Stock",     _expanded: false },
            { id:"P005", name:"Mechanical Keyboard", category:"Accessories", price:"149.99",  status:"Available",   stock:"Low Stock",    _expanded: false }
            ]
        });

        oModel.setDefaultBindingMode(BindingMode.TwoWay);
        this.setModel(oModel, "products");
        }
    });
});