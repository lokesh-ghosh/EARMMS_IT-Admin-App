sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter"
], function (Controller, formatter) {
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
        }
    });
});
