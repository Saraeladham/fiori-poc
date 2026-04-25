    sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/m/Menu",
    "sap/m/MenuItem"
    ], function (
    Controller, Filter, FilterOperator,
    JSONModel, MessageBox, Fragment, Menu, MenuItem
    ) {
    "use strict";

    return Controller.extend("com.poc.fiori.controller.Main", {

        // ============================================================
        // LIFECYCLE
        // ============================================================
        onInit: function () {
        this._oSelectedContext = null;
        this._sDialogMode      = null;
        this._oContextMenu     = null;
        this._sSearchQuery     = "";
        this._sCategoryFilter  = "ALL";
        this._sStockFilter     = "ALL";

        var oDialogModel = new JSONModel({
            title: "", saveLabel: "Save",
            name: "", category: "Electronics",
            price: "", status: "Available", stock: "In Stock"
        });
        this.getView().setModel(oDialogModel, "dialog");

        // Update counters after model loads
        var oModel = this.getOwnerComponent().getModel("products");
        oModel.attachRequestCompleted(this._updateCounters.bind(this));
        // For hardcoded/inline data, call directly after a tick
        setTimeout(this._updateCounters.bind(this), 100);
        },

        // ============================================================
        // COUNTERS in DynamicPageTitle
        // ============================================================
        _updateCounters: function () {
        var oModel    = this.getOwnerComponent().getModel("products");
        var aProducts = oModel.getProperty("/products") || [];
        his.getView().byId("snappedCount").setText(aProducts.length + " Products");
        var iTotal    = aProducts.length;
        var iInStock  = aProducts.filter(function (p) { return p.stock === "In Stock"; }).length;
        var iLow      = aProducts.filter(function (p) { return p.stock === "Low Stock"; }).length;
        var iOut      = aProducts.filter(function (p) { return p.stock === "Out of Stock"; }).length;

        var oView = this.getView();
        // oView.byId("totalCount").setText(iTotal + " Products");
        // oView.byId("inStockCount").setText(iInStock + " In Stock");
        // oView.byId("lowStockCount").setText(iLow + " Low Stock");
        // oView.byId("outOfStockCount").setText(iOut + " Out of Stock");
        // oView.byId("snappedCount").setText(iTotal + " Products");
        },

        // ============================================================
        // SEARCH
        // ============================================================
        onSearch: function (oEvent) {
        this._sSearchQuery = oEvent.getParameter("newValue");
        this._applyFilters();
        },

        // ============================================================
        // CATEGORY FILTER
        // ============================================================
        onCategoryFilter: function (oEvent) {
        this._sCategoryFilter = oEvent.getParameter("selectedItem").getKey();
        this._applyFilters();
        },

        // ============================================================
        // STOCK FILTER
        // ============================================================
        onStockFilter: function (oEvent) {
        this._sStockFilter = oEvent.getParameter("selectedItem").getKey();
        this._applyFilters();
        },

        // ============================================================
        // COMBINED FILTER ENGINE
        // ============================================================
        _applyFilters: function () {
        var aFilters = [];

        if (this._sSearchQuery) {
            aFilters.push(new Filter("name", FilterOperator.Contains, this._sSearchQuery));
        }
        if (this._sCategoryFilter !== "ALL") {
            aFilters.push(new Filter("category", FilterOperator.EQ, this._sCategoryFilter));
        }
        if (this._sStockFilter !== "ALL") {
            aFilters.push(new Filter("stock", FilterOperator.EQ, this._sStockFilter));
        }

        var oCombined = aFilters.length > 1
            ? new Filter({ filters: aFilters, and: true })
            : aFilters[0] || [];

        this.byId("productList").getBinding("items").filter(oCombined);
        },

        // ============================================================
        // ITEM PRESS — context menu
        // ============================================================
        onItemPress: function (oEvent) {
        var oItem = oEvent.getSource();
        this._oSelectedContext = oItem.getBindingContext("products");

        if (!this._oContextMenu) {
            this._oContextMenu = new Menu({
            items: [
                new MenuItem({
                text: "Details",
                icon: "sap-icon://detail-view",
                press: this._onMenuDetails.bind(this)
                }),
                new MenuItem({
                text: "Edit",
                icon: "sap-icon://edit",
                press: this._onMenuEdit.bind(this)
                }),
                new MenuItem({
                text: "Delete",
                icon: "sap-icon://delete",
                press: this._onMenuDelete.bind(this)
                })
            ]
            });
            this.getView().addDependent(this._oContextMenu);
        }

        this._oContextMenu.openBy(oItem);
        },

        // ============================================================
        // DETAILS — toggle expand
        // ============================================================
        _onMenuDetails: function () {
        if (!this._oSelectedContext) { return; }

        var oModel    = this.getOwnerComponent().getModel("products");
        var sPath     = this._oSelectedContext.getPath();
        var bExpanded = oModel.getProperty(sPath + "/_expanded");

        // Collapse all first
        var aProducts = oModel.getProperty("/products");
        aProducts.forEach(function (p, i) {
            oModel.setProperty("/products/" + i + "/_expanded", false);
        });

        // Toggle selected
        oModel.setProperty(sPath + "/_expanded", !bExpanded);
        },

        // ============================================================
        // EDIT
        // ============================================================
        _onMenuEdit: function () {
        if (!this._oSelectedContext) { return; }
        this._sDialogMode = "edit";

        var oProduct = this._oSelectedContext.getObject();
        this.getView().getModel("dialog").setData({
            title: "Edit Product", saveLabel: "Update",
            name: oProduct.name, category: oProduct.category,
            price: oProduct.price, status: oProduct.status,
            stock: oProduct.stock
        });

        this._openDialog();
        },

        // ============================================================
        // DELETE
        // ============================================================
        _onMenuDelete: function () {
        if (!this._oSelectedContext) { return; }

        var sName = this._oSelectedContext.getObject().name;
        var sPath = this._oSelectedContext.getPath();

        MessageBox.confirm("Are you sure you want to delete '" + sName + "'?", {
            title: "Confirm Delete",
            onClose: function (sAction) {
            if (sAction === MessageBox.Action.OK) {
                var oModel    = this.getOwnerComponent().getModel("products");
                var aProducts = oModel.getProperty("/products");
                var iIndex    = parseInt(sPath.split("/").pop());
                aProducts.splice(iIndex, 1);
                oModel.setProperty("/products", aProducts);
                this._showMessage("warning", "'" + sName + "' was deleted.");
                this._oSelectedContext = null;
                this._updateCounters();
            }
            }.bind(this)
        });
        },

        // ============================================================
        // ADD
        // ============================================================
        onAddProduct: function () {
        this._sDialogMode = "add";
        this.getView().getModel("dialog").setData({
            title: "Add New Product", saveLabel: "Add",
            name: "", category: "Electronics",
            price: "", status: "Available", stock: "In Stock"
        });
        this._openDialog();
        },

        // ============================================================
        // SAVE
        // ============================================================
        onSaveProduct: function () {
        var oData  = this.getView().getModel("dialog").getData();
        var oModel = this.getOwnerComponent().getModel("products");
        var aProds = oModel.getProperty("/products");

        if (!oData.name || !oData.price) {
            this._showMessage("error", "Please fill in all required fields.");
            return;
        }

        if (this._sDialogMode === "add") {
            aProds.push({
            id: "P00" + (aProds.length + 1),
            name: oData.name, category: oData.category,
            price: oData.price, status: oData.status,
            stock: oData.stock, _expanded: false
            });
            oModel.setProperty("/products", aProds);
            this._showMessage("success", "'" + oData.name + "' added successfully.");

        } else if (this._sDialogMode === "edit") {
            var sPath = this._oSelectedContext.getPath();
            oModel.setProperty(sPath + "/name",     oData.name);
            oModel.setProperty(sPath + "/category", oData.category);
            oModel.setProperty(sPath + "/price",    oData.price);
            oModel.setProperty(sPath + "/status",   oData.status);
            oModel.setProperty(sPath + "/stock",    oData.stock);
            this._showMessage("success", "'" + oData.name + "' updated successfully.");
        }

        this._closeDialog();
        this._updateCounters();
        },

        // ============================================================
        // DIALOG HELPERS
        // ============================================================
        _openDialog: function () {
        if (!this._oDialog) {
            Fragment.load({
            id: this.getView().getId(),
            name: "com.poc.fiori.view.ProductDialog",
            controller: this
            }).then(function (oDialog) {
            this._oDialog = oDialog;
            this.getView().addDependent(oDialog);
            oDialog.open();
            }.bind(this));
        } else {
            this._oDialog.open();
        }
        },

        onCancelDialog: function () { this._closeDialog(); },

        _closeDialog: function () {
        if (this._oDialog) { this._oDialog.close(); }
        },

        // ============================================================
        // MESSAGE STRIP
        // ============================================================
        _showMessage: function (sType, sText) {
        var oStrip  = this.byId("messageStrip");
        var sUiType = { success: "Success", error: "Error", warning: "Warning" }[sType] || "Information";
        oStrip.setType(sUiType);
        oStrip.setText(sText);
        oStrip.setVisible(true);
        setTimeout(function () { oStrip.setVisible(false); }, 4000);
        },

        onMessageStripClose: function () {
        this.byId("messageStrip").setVisible(false);
        },

        // ============================================================
        // FORMATTERS
        // ============================================================
        formatStockState: function (sStock) {
        return { "In Stock": "Success", "Low Stock": "Warning", "Out of Stock": "Error" }[sStock] || "None";
        },

        formatProductStatus: function (sStatus) {
        return { "Available": "Success", "Discontinued": "Error", "Coming Soon": "Warning" }[sStatus] || "None";
        },

        formatStatusIcon: function (sStatus) {
        return {
            "Available":   "sap-icon://accept",
            "Discontinued":"sap-icon://cancel",
            "Coming Soon": "sap-icon://pending"
        }[sStatus] || "";
        }

    });
    });