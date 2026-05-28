sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter"
], function (Controller, Filter, FilterOperator, Sorter, formatter) {
    "use strict";

    return Controller.extend("com.wipro.earmms.itadmin.app.earmmsitadminapp.controller.Dashboard", {
        formatter: formatter,

        onInit: function () {},

        onNavigateRR: function () {
            this.getOwnerComponent().getEventBus().publish("App", "Navigate", { key: "repairRequests" });
        },

        onNavigateMR: function () {
            this.getOwnerComponent().getEventBus().publish("App", "Navigate", { key: "mitigationInbox" });
        },

        onNavigateSpare: function () {
            this.getOwnerComponent().getEventBus().publish("App", "Navigate", { key: "sparePool" });
        },

        onPendingMRPress: function () {
            this.getOwnerComponent().getEventBus().publish("App", "Navigate", { key: "mitigationInbox" });
        },

        onRRPress: function () {
            this.getOwnerComponent().getEventBus().publish("App", "Navigate", { key: "repairRequests" });
        },

        onRefresh: function () {
            sap.m.MessageToast.show("Dashboard refreshed");
        },

        // ── Recent Repair Requests — Filter / Search / Sort ──────────

        onDashRRSearch: function (oEvent) {
            this._applyDashRRFilters(oEvent.getParameter("newValue") || "");
        },

        onDashRRFilter: function () {
            this._applyDashRRFilters(this.byId("dashRRSearch").getValue());
        },

        onDashRRSort: function () {
            this._applyDashRRFilters(this.byId("dashRRSearch").getValue());
        },

        onDashRRClear: function () {
            this.byId("dashRRSearch").setValue("");
            this.byId("dashRRStatus").setSelectedKey("");
            this.byId("dashRRSeverity").setSelectedKey("");
            this.byId("dashRRSort").setSelectedKey("");
            var oBinding = this.byId("recentRRTable").getBinding("items");
            oBinding.filter([]);
            oBinding.sort([]);
        },

        _applyDashRRFilters: function (sQuery) {
            var aFilters  = [];
            var sStatus   = this.byId("dashRRStatus").getSelectedKey();
            var sSeverity = this.byId("dashRRSeverity").getSelectedKey();

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("requestNumber", FilterOperator.Contains, sQuery),
                        new Filter("assetTag",      FilterOperator.Contains, sQuery),
                        new Filter("employeeName",  FilterOperator.Contains, sQuery),
                        new Filter("assetType",     FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            if (sStatus)   { aFilters.push(new Filter("status",   FilterOperator.EQ, sStatus));   }
            if (sSeverity) { aFilters.push(new Filter("severity", FilterOperator.EQ, sSeverity)); }

            var oBinding = this.byId("recentRRTable").getBinding("items");
            oBinding.filter(aFilters);

            var sSortKey = this.byId("dashRRSort").getSelectedKey();
            var aSorters = [];
            if      (sSortKey === "raisedOn_desc") { aSorters.push(new Sorter("raisedOn", true));  }
            else if (sSortKey === "raisedOn_asc")  { aSorters.push(new Sorter("raisedOn", false)); }
            else if (sSortKey === "severity")      { aSorters.push(new Sorter("severity", false)); }
            else if (sSortKey === "slaStatus")     { aSorters.push(new Sorter("slaStatus", false));}
            oBinding.sort(aSorters);
        }
    });
});
