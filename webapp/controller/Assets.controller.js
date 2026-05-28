sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/HTML",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter"
], function (Controller, HTML, Filter, FilterOperator, MessageToast, Dialog, Button, formatter) {
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
            var oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            var oAsset = oCtx.getObject();

            var s  = function (v) { return (v != null && v !== "") ? String(v) : "—"; };
            var sc = { Success: "#16a34a", Warning: "#d97706", Error: "#dc2626", Information: "#2563eb", None: "#64748b" };
            var col = function (state) { return sc[state] || "#334155"; };

            var statusState = formatter.assetStatusToState(oAsset.status);
            var makeModel   = [oAsset.make, oAsset.model].filter(Boolean).join(" ") || "—";
            var sAge = oAsset.purchaseDate
                ? Math.floor((new Date() - new Date(oAsset.purchaseDate)) / (365.25 * 24 * 3600 * 1000)) + " yr(s)"
                : "—";

            function sb(lbl, val, color) {
                return '<div class="dlgSB"><div class="dlgSBLabel">' + lbl + '</div>' +
                       '<div class="dlgSBValue" style="color:' + color + '">' + s(val) + '</div></div>';
            }
            function fi(lbl, val) {
                return '<div class="dlgFI"><div class="dlgFILabel">' + lbl + '</div>' +
                       '<div class="dlgFIValue">' + s(val) + '</div></div>';
            }
            function sec(title, body) {
                return '<div class="dlgSec"><div class="dlgSecTitle">' + title + '</div>' + body + '</div>';
            }

            var sHtml = '<div class="dlgBody">' +
                sec("Identity",
                    '<div class="dlgSBRow">' +
                    sb("Asset Tag",    oAsset.assetTag,      "#2563eb")          +
                    sb("Type",         oAsset.typeName,      "#334155")          +
                    sb("Status",       oAsset.status,        col(statusState))   +
                    sb("Serial #",     oAsset.serialNumber,  "#334155")          +
                    '</div>') +
                sec("Hardware",
                    '<div class="dlgFRow">' +
                    fi("Make",        oAsset.make)   +
                    fi("Model",       oAsset.model)  +
                    fi("Make / Model", makeModel)    +
                    '</div>') +
                sec("Assignment",
                    '<div class="dlgFRow">' +
                    fi("Current Owner", oAsset.ownerName || "Unassigned") +
                    fi("Location",      oAsset.location)                  +
                    fi("Department",    oAsset.department)                +
                    '</div>') +
                sec("Lifecycle",
                    '<div class="dlgFRow">' +
                    fi("Purchase Date",   formatter.formatDate(oAsset.purchaseDate))    +
                    fi("Warranty Expiry", formatter.formatDate(oAsset.warrantyExpiry))  +
                    fi("Asset Age",       sAge)                                         +
                    '</div>') +
                '</div>';

            var oDialog = new Dialog({
                title: "Asset Details — " + s(oAsset.assetTag),
                contentWidth: "560px",
                verticalScrolling: true,
                content: [new HTML({ content: sHtml })],
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
