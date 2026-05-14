sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox, formatter) {
    "use strict";

    return Controller.extend("com.wipro.earmms.itadmin.app.earmmsitadminapp.controller.SparePool", {
        formatter: formatter,

        onInit: function () {},

        onSpareSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue") || "";
            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("assetTag",    FilterOperator.Contains, sQuery),
                        new Filter("typeName",    FilterOperator.Contains, sQuery),
                        new Filter("make",        FilterOperator.Contains, sQuery),
                        new Filter("model",       FilterOperator.Contains, sQuery),
                        new Filter("serialNumber",FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            this.byId("spareTable").getBinding("items").filter(aFilters);
        },

        onMarkSpareReturned: function (oEvent) {
            var oCtx  = oEvent.getSource().getBindingContext();
            var oSpare = oCtx.getObject();
            var that  = this;

            MessageBox.confirm(
                "Mark " + oSpare.assetTag + " as returned from " + (oSpare.employeeName || "employee") + "?",
                {
                    title: "Confirm Return",
                    onClose: function (sAction) {
                        if (sAction !== MessageBox.Action.OK) { return; }
                        var oModel = that.getOwnerComponent().getModel();
                        var oData  = oModel.getData();

                        // Update spare
                        var oS = oData.sparePool.find(function (s) { return s.poolId === oSpare.poolId; });
                        if (oS) {
                            oS.availabilityStatus = "Available";
                            oS.mitigationId       = null;
                            oS.mitigationNumber   = null;
                            oS.employeeName       = null;
                        }

                        // Update linked MR
                        var oMR = oData.mitigationRequests.find(function (m) { return m.sparePoolId === oSpare.poolId && m.status === "Issued"; });
                        if (oMR) {
                            oMR.returnedOn = new Date().toISOString();
                            oMR.status     = "Returned";
                        }

                        oData.kpis.activeMitigations = oData.mitigationRequests.filter(function (m) { return m.status === "Issued"; }).length;
                        oData.kpis.availableSpares   = oData.sparePool.filter(function (s) { return s.availabilityStatus === "Available"; }).length;

                        oModel.refresh(true);
                        MessageToast.show(oSpare.assetTag + " is now available in the spare pool.");
                    }
                }
            );
        },

        onReleaseReservation: function (oEvent) {
            var oCtx   = oEvent.getSource().getBindingContext();
            var oSpare = oCtx.getObject();
            var that   = this;

            MessageBox.confirm(
                "Release reservation of " + oSpare.assetTag + " (linked to " + (oSpare.mitigationNumber || "MR") + ")?",
                {
                    title: "Release Reservation",
                    onClose: function (sAction) {
                        if (sAction !== MessageBox.Action.OK) { return; }
                        var oModel = that.getOwnerComponent().getModel();
                        var oData  = oModel.getData();
                        var oS = oData.sparePool.find(function (s) { return s.poolId === oSpare.poolId; });
                        if (oS) {
                            oS.availabilityStatus = "Available";
                            oS.mitigationId       = null;
                            oS.mitigationNumber   = null;
                            oS.employeeName       = null;
                        }
                        oData.kpis.availableSpares = oData.sparePool.filter(function (s) { return s.availabilityStatus === "Available"; }).length;
                        oModel.refresh(true);
                        MessageToast.show("Reservation released. " + oSpare.assetTag + " is now available.");
                    }
                }
            );
        },

        onRefresh: function () {
            this.byId("spareTable").getBinding("items").filter([]);
            this.byId("spareSearch").setValue("");
            MessageToast.show("Spare pool refreshed");
        }
    });
});
