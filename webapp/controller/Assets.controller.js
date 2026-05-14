sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Label",
    "sap/m/ObjectStatus",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter"
], function (Controller, Filter, FilterOperator, MessageToast, Dialog, Button, VBox, HBox, Label, ObjectStatus, formatter) {
    "use strict";

    return Controller.extend("com.wipro.earmms.itadmin.app.earmmsitadminapp.controller.Assets", {
        formatter: formatter,

        onInit: function () {},

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue") || "";
            this._applyFilters(sQuery);
        },

        onFilterChange: function () {
            this._applyFilters(this.byId("assetSearch").getValue());
        },

        onClearFilters: function () {
            this.byId("assetSearch").setValue("");
            this.byId("typeFilter").setSelectedKey("");
            this.byId("statusFilter").setSelectedKey("");
            this.byId("assetTable").getBinding("items").filter([]);
        },

        _applyFilters: function (sQuery) {
            var aFilters = [];
            var sType   = this.byId("typeFilter").getSelectedKey();
            var sStatus = this.byId("statusFilter").getSelectedKey();

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("assetTag",  FilterOperator.Contains, sQuery),
                        new Filter("make",      FilterOperator.Contains, sQuery),
                        new Filter("model",     FilterOperator.Contains, sQuery),
                        new Filter("ownerName", FilterOperator.Contains, sQuery),
                        new Filter("location",  FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            if (sType)   { aFilters.push(new Filter("assetType", FilterOperator.EQ, sType));   }
            if (sStatus) { aFilters.push(new Filter("status",    FilterOperator.EQ, sStatus)); }

            this.byId("assetTable").getBinding("items").filter(aFilters);
        },

        onAssetPress: function (oEvent) {
            var oCtx   = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            var oAsset = oCtx.getObject();
            var that   = this;

            var oDialog = new Dialog({
                title: "Asset Details — " + oAsset.assetTag,
                contentWidth: "520px",
                content: [
                    new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Asset Tag", design: "Bold" })).addItem(new Label({ text: oAsset.assetTag }))
                    ).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Type", design: "Bold" })).addItem(new Label({ text: oAsset.typeName }))
                    ).addItem(
                        new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Status", design: "Bold" })).addItem(new ObjectStatus({ text: oAsset.status, state: formatter.assetStatusToState(oAsset.status) }))
                    ),
                    new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Make", design: "Bold" })).addItem(new Label({ text: oAsset.make }))
                    ).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Model", design: "Bold" })).addItem(new Label({ text: oAsset.model }))
                    ).addItem(
                        new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Serial Number", design: "Bold" })).addItem(new Label({ text: oAsset.serialNumber }))
                    ),
                    new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Current Owner", design: "Bold" })).addItem(new Label({ text: oAsset.ownerName || "Unassigned" }))
                    ).addItem(
                        new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Location", design: "Bold" })).addItem(new Label({ text: oAsset.location }))
                    ),
                    new HBox({ renderType: "Bare", wrap: "Wrap" }).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Purchase Date", design: "Bold" })).addItem(new Label({ text: formatter.formatDate(oAsset.purchaseDate) }))
                    ).addItem(
                        new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Warranty Expiry", design: "Bold" })).addItem(new Label({ text: formatter.formatDate(oAsset.warrantyExpiry) }))
                    )
                ],
                buttons: [new Button({ text: "Close", press: function () { oDialog.close(); } })],
                afterClose: function () { oDialog.destroy(); }
            });

            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        onRefresh: function () {
            this.onClearFilters();
            MessageToast.show("Asset list refreshed");
        }
    });
});
