sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/HTML",
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
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/dataService"
], function (Controller, HTML, Filter, FilterOperator, MessageToast, MessageBox,
    Dialog, Button, VBox, HBox, Label, Select, Text, ObjectStatus, Item, formatter, dataService) {
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
                oData.kpis = dataService.computeKpis(oData);
                oModel.refresh(true);
                MessageToast.show("Technician " + oTech.name + " assigned to " + oRR.requestNumber);
                this._oAssignDialog.close();

                dataService.patchAssignTechnician(oRR.requestId, sTechId, oTech.name, oTech.currentLoad)
                    .catch(function (oErr) {
                        MessageBox.warning(
                            "Assignment saved locally but could not be persisted to the server.\n\nError: " + (oErr.message || oErr),
                            { title: "OData Write Failed" }
                        );
                    });
            }
        },

        _showRRDetail: function (oRR) {
            var that = this;
            var s  = function (v) { return (v != null && v !== "") ? String(v) : "—"; };
            var sc = { Success: "#16a34a", Warning: "#d97706", Error: "#dc2626", Information: "#2563eb", None: "#64748b" };
            var col = function (state) { return sc[state] || "#64748b"; };

            var slaState = formatter.slaToState(oRR.slaStatus);
            var sevState = formatter.severityToState(oRR.severity);
            var rrState  = formatter.rrStatusToState(oRR.status);

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

            var assetDesc = [oRR.assetType, oRR.assetMake, oRR.assetModel].filter(Boolean).join(" · ") || "—";
            var raisedBy  = [oRR.employeeName, oRR.department ? "(" + oRR.department + ")" : ""].filter(Boolean).join(" ") || "—";

            var sHtml = '<div class="dlgBody">' +
                sec("Summary",
                    '<div class="dlgSBRow">' +
                    sb("RR Number",  oRR.requestNumber, "#2563eb")             +
                    sb("Status",     oRR.status,        col(rrState))          +
                    sb("Severity",   oRR.severity,      col(sevState))         +
                    sb("SLA Status", oRR.slaStatus,     col(slaState))         +
                    '</div>') +
                sec("Asset Details",
                    '<div class="dlgFRow">' +
                    fi("Asset Tag",  oRR.assetTag)   +
                    fi("Asset Type", assetDesc)       +
                    fi("Category",   oRR.issueCategory) +
                    '</div>') +
                sec("Raised By &amp; Timeline",
                    '<div class="dlgFRow">' +
                    fi("Raised By",           raisedBy)                                   +
                    fi("Raised On",           formatter.formatDateTime(oRR.raisedOn))      +
                    fi("Expected Resolution", formatter.formatDateTime(oRR.expectedResolution)) +
                    '</div>') +
                sec("Issue Description",
                    '<div class="dlgDescBlock">' + (oRR.issueDescription || "—") + '</div>') +
                sec("Resolution",
                    '<div class="dlgFRow">' +
                    fi("Assigned Technician", oRR.technicianName || "Not Assigned") +
                    fi("Actual Resolution",   formatter.formatDateTime(oRR.actualResolution)) +
                    '</div>') +
                (oRR.resolutionNotes ?
                    sec("Resolution Notes", '<div class="dlgDescBlock">' + oRR.resolutionNotes + '</div>') : "") +
                '</div>';

            var aButtons = [
                new Button({ text: "Close", press: function () { that._oDetailDialog.close(); } })
            ];
            if (oRR.status === "Open") {
                aButtons.unshift(new Button({
                    text: "Assign Technician",
                    type: "Emphasized",
                    icon: "sap-icon://employee",
                    press: function () {
                        that._oDetailDialog.close();
                        that._oCurrentRR = oRR;
                        that._openAssignDialog();
                    }
                }));
            }

            if (this._oDetailDialog) { this._oDetailDialog.destroy(); }
            this._oDetailDialog = new Dialog({
                title: "Repair Request — " + s(oRR.requestNumber),
                contentWidth: "600px",
                verticalScrolling: true,
                content: [new HTML({ content: sHtml })],
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
