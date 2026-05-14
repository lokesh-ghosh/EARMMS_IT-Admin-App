sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/ObjectStatus",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter"
], function (Controller, MessageToast, Dialog, Button, VBox, HBox, Label, Text, ObjectStatus, formatter) {
    "use strict";

    return Controller.extend("com.wipro.earmms.itadmin.app.earmmsitadminapp.controller.Technicians", {
        formatter: formatter,

        onInit: function () {},

        onTechPress: function (oEvent) {
            var oCtx  = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            var oTech = oCtx.getObject();
            var oData = this.getOwnerComponent().getModel().getData();

            // Find assigned tickets
            var aTickets = (oData.repairRequests || []).filter(function (r) {
                return r.technicianId === oTech.technicianId && ["Assigned", "InProgress"].indexOf(r.status) > -1;
            });

            var aTicketRows = aTickets.map(function (r) {
                return new HBox({ renderType: "Bare", class: "mb025", alignItems: "Center" }).addItem(
                    new Label({ text: r.requestNumber, design: "Bold", class: "mr05 textInfo" })
                ).addItem(
                    new Label({ text: "·", class: "mr05 textMuted" })
                ).addItem(
                    new Label({ text: r.assetTag + "  (" + r.assetType + ")", class: "mr05 textSmall" })
                ).addItem(
                    new ObjectStatus({ text: r.status, state: formatter.rrStatusToState(r.status), class: "mr05" })
                ).addItem(
                    new ObjectStatus({ text: r.severity, state: formatter.severityToState(r.severity) })
                );
            });

            var pct  = formatter.loadToPercent(oTech.currentLoad, oTech.maxLoad);
            var that = this;

            var oDialog = new Dialog({
                title: "Technician Profile — " + oTech.name,
                contentWidth: "540px",
                content: [
                    new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Technician ID", design: "Bold" })).addItem(new Label({ text: oTech.technicianId }))
                    ).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Specialization", design: "Bold" })).addItem(new Label({ text: oTech.specialization }))
                    ).addItem(
                        new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Current Load", design: "Bold" })).addItem(new ObjectStatus({ text: oTech.currentLoad + "/" + oTech.maxLoad + " tickets (" + pct + "%)", state: formatter.loadToState(oTech.currentLoad, oTech.maxLoad) }))
                    ),
                    new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Email", design: "Bold" })).addItem(new Label({ text: oTech.email }))
                    ).addItem(
                        new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Phone", design: "Bold" })).addItem(new Label({ text: oTech.phone }))
                    ),
                    new Label({ text: "Active Tickets (" + aTickets.length + "):", design: "Bold", class: "mb025" }),
                    aTickets.length > 0
                        ? (function () { var oV = new VBox({ renderType: "Bare" }); aTicketRows.forEach(function (r) { oV.addItem(r); }); return oV; }())
                        : new Label({ text: "No active tickets assigned", class: "textMuted textSmall" })
                ],
                buttons: [new Button({ text: "Close", press: function () { oDialog.close(); } })],
                afterClose: function () { oDialog.destroy(); }
            });

            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        onRefresh: function () {
            MessageToast.show("Technician data refreshed");
        }
    });
});
