sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Label",
    "sap/m/Select",
    "sap/m/Text",
    "sap/m/ObjectStatus",
    "sap/ui/core/Item",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox,
    Dialog, Button, VBox, HBox, Label, Select, Text, ObjectStatus, Item, formatter) {
    "use strict";

    return Controller.extend("com.wipro.earmms.itadmin.app.earmmsitadminapp.controller.RepairRequests", {
        formatter: formatter,
        _oAssignDialog: null,
        _oDetailDialog: null,
        _oCurrentRR: null,

        onInit: function () {
            this._updateCount();
        },

        _updateCount: function () {
            var oTable = this.byId("rrTable");
            var oCountLabel = this.byId("rrCountLabel");
            if (oTable && oCountLabel) {
                var iCount = oTable.getBinding("items") ? oTable.getBinding("items").getLength() : (this.getOwnerComponent().getModel().getData().repairRequests || []).length;
                oCountLabel.setText(iCount + " record(s)");
            }
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue") || "";
            this._applyFilters(sQuery);
        },

        onFilterChange: function () {
            var sQuery = this.byId("rrSearchField").getValue();
            this._applyFilters(sQuery);
        },

        onClearFilters: function () {
            this.byId("rrSearchField").setValue("");
            this.byId("statusFilter").setSelectedKey("");
            this.byId("severityFilter").setSelectedKey("");
            this.byId("slaFilter").setSelectedKey("");
            this.byId("rrTable").getBinding("items").filter([]);
            this._updateCount();
        },

        _applyFilters: function (sQuery) {
            var aFilters = [];
            var sStatus = this.byId("statusFilter").getSelectedKey();
            var sSeverity = this.byId("severityFilter").getSelectedKey();
            var sSla = this.byId("slaFilter").getSelectedKey();

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("requestNumber", FilterOperator.Contains, sQuery),
                        new Filter("assetTag", FilterOperator.Contains, sQuery),
                        new Filter("employeeName", FilterOperator.Contains, sQuery),
                        new Filter("issueCategory", FilterOperator.Contains, sQuery),
                        new Filter("assetType", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            if (sStatus)   { aFilters.push(new Filter("status",    FilterOperator.EQ, sStatus));   }
            if (sSeverity) { aFilters.push(new Filter("severity",  FilterOperator.EQ, sSeverity)); }
            if (sSla)      { aFilters.push(new Filter("slaStatus", FilterOperator.EQ, sSla));      }

            this.byId("rrTable").getBinding("items").filter(aFilters);
            this._updateCount();
        },

        onRRRowPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            var oRR = oCtx.getObject();
            this._showRRDetail(oRR);
        },

        onAssignTechnician: function (oEvent) {
            oEvent.stopPropagation();
            var oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            this._oCurrentRR = oCtx.getObject();
            this._openAssignDialog();
        },

        _openAssignDialog: function () {
            var oRR = this._oCurrentRR;
            var oData = this.getOwnerComponent().getModel().getData();
            var aTechnicians = oData.technicians || [];

            var oSelect = new Select({
                width: "100%",
                forceSelection: true
            });
            aTechnicians.forEach(function (t) {
                oSelect.addItem(new Item({
                    key: t.technicianId,
                    text: t.name + "  |  " + t.specialization + "  (Load: " + t.currentLoad + "/" + t.maxLoad + ")"
                }));
            });

            // Pre-select lowest load
            var oLowest = aTechnicians.reduce(function (a, b) { return a.currentLoad <= b.currentLoad ? a : b; }, aTechnicians[0]);
            if (oLowest) { oSelect.setSelectedKey(oLowest.technicianId); }

            var that = this;
            if (this._oAssignDialog) { this._oAssignDialog.destroy(); }

            this._oAssignDialog = new Dialog({
                title: "Assign Technician",
                contentWidth: "420px",
                content: [
                    new VBox({ class: "earmmsDialogContent", renderType: "Bare" }).addItem(
                        new HBox({ renderType: "Bare", class: "mb1" }).addItem(
                            new Label({ text: "Repair Request:" })
                        ).addItem(new Label({ text: "  " + oRR.requestNumber + " — " + oRR.assetTag, design: "Bold" }))
                    ).addItem(
                        new HBox({ renderType: "Bare", class: "mb1" }).addItem(
                            new Label({ text: "Issue Category:" })
                        ).addItem(new Label({ text: "  " + oRR.issueCategory + " / " + oRR.severity, design: "Bold" }))
                    ).addItem(
                        new Label({ text: "Select Technician", design: "Bold", class: "mb025" })
                    ).addItem(oSelect)
                ],
                beginButton: new Button({
                    text: "Assign Technician",
                    type: "Emphasized",
                    press: function () {
                        var sKey = oSelect.getSelectedKey();
                        if (!sKey) { MessageToast.show("Please select a technician"); return; }
                        that._confirmAssign(sKey);
                    }
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () { that._oAssignDialog.close(); }
                }),
                afterClose: function () { that._oAssignDialog.destroy(); that._oAssignDialog = null; }
            });

            this.getView().addDependent(this._oAssignDialog);
            this._oAssignDialog.open();
        },

        _confirmAssign: function (sTechId) {
            var oModel = this.getOwnerComponent().getModel();
            var oData = oModel.getData();
            var oRR = oData.repairRequests.find(function (r) { return r.requestId === this._oCurrentRR.requestId; }, this);
            var oTech = oData.technicians.find(function (t) { return t.technicianId === sTechId; });

            if (oRR && oTech) {
                oRR.status = "Assigned";
                oRR.technicianId = sTechId;
                oRR.technicianName = oTech.name;
                oTech.currentLoad += 1;
                oData.kpis.openTickets = oData.repairRequests.filter(function (r) {
                    return ["Open", "Assigned", "InProgress"].indexOf(r.status) > -1;
                }).length;
                oModel.refresh(true);
                MessageToast.show("Technician " + oTech.name + " assigned to " + oRR.requestNumber);
            }
            this._oAssignDialog.close();
        },

        _showRRDetail: function (oRR) {
            var that = this;
            if (this._oDetailDialog) { this._oDetailDialog.destroy(); }

            var slaState = formatter.slaToState(oRR.slaStatus);
            var sevState = formatter.severityToState(oRR.severity);
            var rrState  = formatter.rrStatusToState(oRR.status);

            var aContent = [
                new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                    new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "RR Number", design: "Bold" })).addItem(new Label({ text: oRR.requestNumber }))
                ).addItem(
                    new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Status", design: "Bold" })).addItem(new ObjectStatus({ text: oRR.status, state: rrState }))
                ).addItem(
                    new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Severity", design: "Bold" })).addItem(new ObjectStatus({ text: oRR.severity, state: sevState }))
                ).addItem(
                    new VBox({ renderType: "Bare" }).addItem(new Label({ text: "SLA Status", design: "Bold" })).addItem(new ObjectStatus({ text: oRR.slaStatus, state: slaState }))
                ),
                new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                    new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Asset Tag", design: "Bold" })).addItem(new Label({ text: oRR.assetTag }))
                ).addItem(
                    new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Asset Type", design: "Bold" })).addItem(new Label({ text: oRR.assetType + " (" + oRR.assetMake + " " + oRR.assetModel + ")" }))
                ).addItem(
                    new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Category", design: "Bold" })).addItem(new Label({ text: oRR.issueCategory }))
                ),
                new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                    new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Raised By", design: "Bold" })).addItem(new Label({ text: oRR.employeeName + " (" + oRR.department + ")" }))
                ).addItem(
                    new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Raised On", design: "Bold" })).addItem(new Label({ text: formatter.formatDateTime(oRR.raisedOn) }))
                ).addItem(
                    new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Expected Resolution", design: "Bold" })).addItem(new Label({ text: formatter.formatDateTime(oRR.expectedResolution) }))
                ),
                new VBox({ renderType: "Bare", class: "mb1" }).addItem(new Label({ text: "Issue Description", design: "Bold", class: "mb025" })).addItem(new Text({ text: oRR.issueDescription })),
                new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                    new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Assigned Technician", design: "Bold" })).addItem(new Label({ text: oRR.technicianName || "Not Assigned" }))
                ).addItem(
                    new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Actual Resolution", design: "Bold" })).addItem(new Label({ text: formatter.formatDateTime(oRR.actualResolution) }))
                )
            ];

            if (oRR.resolutionNotes) {
                aContent.push(
                    new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Resolution Notes", design: "Bold", class: "mb025" })).addItem(new Text({ text: oRR.resolutionNotes }))
                );
            }

            var aButtons = [
                new Button({ text: "Close", press: function () { that._oDetailDialog.close(); } })
            ];

            if (oRR.status === "Open") {
                aButtons.unshift(new Button({
                    text: "Assign Technician",
                    type: "Emphasized",
                    press: function () {
                        that._oDetailDialog.close();
                        that._oCurrentRR = oRR;
                        that._openAssignDialog();
                    }
                }));
            }

            this._oDetailDialog = new Dialog({
                title: "Repair Request — " + oRR.requestNumber,
                contentWidth: "600px",
                content: aContent,
                buttons: aButtons,
                afterClose: function () { that._oDetailDialog.destroy(); that._oDetailDialog = null; }
            });

            this.getView().addDependent(this._oDetailDialog);
            this._oDetailDialog.open();
        },

        onRefresh: function () {
            this._applyFilters(this.byId("rrSearchField").getValue());
            MessageToast.show("Repair requests refreshed");
        }
    });
});
