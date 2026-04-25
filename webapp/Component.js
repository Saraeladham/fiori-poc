    sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
    ], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("com.poc.fiori.Component", {

        metadata: {
        manifest: "json"
        },

        init: function () {
        // Call parent init — REQUIRED
        UIComponent.prototype.init.apply(this, arguments);

        // Load local JSON model (simulates OData/backend)
        var oModel = new JSONModel(sap.ui.require.toUrl("com/poc/fiori/model/products.json"));
        this.setModel(oModel, "products");
        }
    });
    });