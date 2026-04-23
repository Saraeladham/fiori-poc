    sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
    ], function (Controller, Filter, FilterOperator, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.poc.fiori.controller.Main", {

        // -------------------------------------------------------
        // Lifecycle
        // -------------------------------------------------------
        onInit: function () {
        // Any initialization logic goes here
        console.log("Main Controller Initialized");
        },

        // -------------------------------------------------------
        // Search / Filter
        // -------------------------------------------------------
        onSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        var oList = this.byId("productList");
        var oBinding = oList.getBinding("items");

        var aFilters = [];
        if (sQuery && sQuery.length > 0) {
            aFilters.push(new Filter("name", FilterOperator.Contains, sQuery));
        }

        oBinding.filter(aFilters);
        },

        // -------------------------------------------------------
        // Item Selection
        // -------------------------------------------------------
        onItemSelect: function (oEvent) {
        var oItem = oEvent.getParameter("listItem");
        var oCtx = oItem.getBindingContext("products");
        var oProduct = oCtx.getObject();

        MessageBox.information(
            "Product: " + oProduct.name +
            "\nCategory: " + oProduct.category +
            "\nPrice: $" + oProduct.price +
            "\nStock: " + oProduct.stock,
            { title: "Product Details" }
        );
        },

        // -------------------------------------------------------
        // Add Product (stub — shows how actions are wired)
        // -------------------------------------------------------
        onAddProduct: function () {
        MessageToast.show("Add Product dialog would open here.");
        },

        // -------------------------------------------------------
        // Formatter
        // -------------------------------------------------------
        formatStockState: function (sStock) {
        switch (sStock) {
            case "In Stock":    return "Success";
            case "Low Stock":   return "Warning";
            case "Out of Stock": return "Error";
            default:            return "None";
        }
        }

    });
    });