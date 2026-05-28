sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/dataService"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox, formatter, dataService) {
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
                        var sNow   = new Date().toISOString();

                        var oS = oData.sparePool.find(function (s) { return s.poolId === oSpare.poolId; });
                        if (oS) {
                            oS.availabilityStatus = "Available";
                            oS.mitigationId       = null;
                            oS.mitigationNumber   = null;
                            oS.employeeName       = null;
                        }

                        var oMR = oData.mitigationRequests.find(function (m) { return m.sparePoolId === oSpare.poolId && m.status === "Issued"; });
                        if (oMR) {
                            oMR.returnedOn = sNow;
                            oMR.status     = "Returned";
                        }

                        oData.kpis = dataService.computeKpis(oData);
                        oModel.refresh(true);
                        MessageToast.show(oSpare.assetTag + " is now available in the spare pool.");

                        if (oMR) {
                            dataService.patchProcessReturn(
                                oMR.mitigationId,
                                { returnedOn: sNow, status: "Returned" },
                                oSpare.poolId,
                                { availabilityStatus: "Available", mitigationId: null, mitigationNumber: null, employeeName: null }
                            ).catch(function (oErr) {
                                MessageBox.warning(
                                    "Return saved locally but could not be persisted.\n\nError: " + (oErr.message || oErr),
                                    { title: "OData Write Failed" }
                                );
                            });
                        } else {
                            dataService.patchReleaseReservation(oSpare.poolId, {
                                availabilityStatus: "Available",
                                mitigationId: null, mitigationNumber: null, employeeName: null
                            }).catch(function (oErr) {
                                MessageBox.warning(
                                    "Return saved locally but could not be persisted.\n\nError: " + (oErr.message || oErr),
                                    { title: "OData Write Failed" }
                                );
                            });
                        }
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
                        oData.kpis = dataService.computeKpis(oData);
                        oModel.refresh(true);
                        MessageToast.show("Reservation released. " + oSpare.assetTag + " is now available.");

                        dataService.patchReleaseReservation(oSpare.poolId, {
                            availabilityStatus: "Available",
                            mitigationId: null, mitigationNumber: null, employeeName: null
                        }).catch(function (oErr) {
                            MessageBox.warning(
                                "Reservation release saved locally but could not be persisted.\n\nError: " + (oErr.message || oErr),
                                { title: "OData Write Failed" }
                            );
                        });
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
