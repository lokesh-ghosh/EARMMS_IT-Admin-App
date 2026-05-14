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
    "sap/m/TextArea",
    "sap/m/Text",
    "sap/m/ObjectStatus",
    "sap/ui/core/Item",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox,
    Dialog, Button, VBox, HBox, Label, Select, TextArea, Text, ObjectStatus, Item, formatter) {
    "use strict";

    return Controller.extend("com.wipro.earmms.itadmin.app.earmmsitadminapp.controller.MitigationInbox", {
        formatter: formatter,
        _oCurrentMR: null,

        onInit: function () {},

        // ── Pending Tab ──────────────────────────────────────────────

        onViewMRDetail: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            this._showMRDetail(oCtx.getObject());
        },

        onApproveMR: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            this._oCurrentMR = oCtx.getObject();
            this._openApprovalDialog();
        },

        onRejectMR: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            this._oCurrentMR = oCtx.getObject();
            this._openRejectionDialog();
        },

        _openApprovalDialog: function () {
            var oMR = this._oCurrentMR;
            var oData = this.getOwnerComponent().getModel().getData();
            var aAvailableSpares = (oData.sparePool || []).filter(function (s) {
                return s.availabilityStatus === "Available";
            });

            var oSelect = new Select({
                width: "100%",
                forceSelection: false,
                placeholder: "Select a spare asset…"
            });
            aAvailableSpares.forEach(function (s) {
                oSelect.addItem(new Item({
                    key: s.poolId,
                    text: s.assetTag + "  |  " + s.typeName + "  (" + s.make + " " + s.model + ")"
                }));
            });

            var that = this;
            var oDialog = new Dialog({
                title: "Approve Mitigation — " + oMR.mitigationNumber,
                contentWidth: "480px",
                content: [
                    new VBox({ renderType: "Bare" }).addItem(
                        new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                            new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Employee:", design: "Bold" })).addItem(new Label({ text: oMR.employeeName }))
                        ).addItem(
                            new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Asset:", design: "Bold" })).addItem(new Label({ text: oMR.assetTag }))
                        ).addItem(
                            new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Business Impact:", design: "Bold" })).addItem(new ObjectStatus({ text: oMR.businessImpact, state: formatter.impactToState(oMR.businessImpact) }))
                        )
                    ).addItem(
                        new VBox({ renderType: "Bare", class: "mb1" }).addItem(new Label({ text: "Urgency Reason:", design: "Bold", class: "mb025" })).addItem(new Text({ text: oMR.urgencyReason }))
                    ).addItem(
                        new Label({ text: "Available Spares (" + aAvailableSpares.length + " units):", design: "Bold", class: "mb025" })
                    ).addItem(
                        aAvailableSpares.length > 0 ? oSelect :
                            new Label({ text: "⚠ No spare assets available. Please check inventory.", class: "textError" })
                    )
                ],
                beginButton: new Button({
                    text: "Confirm Approval",
                    type: "Emphasized",
                    enabled: aAvailableSpares.length > 0,
                    press: function () {
                        var sSpareKey = oSelect.getSelectedKey();
                        if (!sSpareKey) { MessageToast.show("Please select a spare asset to allocate"); return; }
                        that._confirmApproval(sSpareKey, oDialog);
                    }
                }),
                endButton: new Button({ text: "Cancel", press: function () { oDialog.close(); } }),
                afterClose: function () { oDialog.destroy(); }
            });

            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        _confirmApproval: function (sSparePoolId, oDialog) {
            var oModel = this.getOwnerComponent().getModel();
            var oData  = oModel.getData();
            var oMR    = oData.mitigationRequests.find(function (m) { return m.mitigationId === this._oCurrentMR.mitigationId; }, this);
            var oSpare = oData.sparePool.find(function (s) { return s.poolId === sSparePoolId; });

            if (oMR && oSpare) {
                oMR.approvalStatus   = "Approved";
                oMR.status           = "Approved";
                oMR.approverId       = "ADMIN01";
                oMR.approverName     = "IT Admin";
                oMR.sparePoolId      = sSparePoolId;
                oMR.spareAssetTag    = oSpare.assetTag;
                oMR.issuedOn         = new Date().toISOString();
                oMR.returnDueDate    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                oMR.status           = "Issued";

                oSpare.availabilityStatus = "InUse";
                oSpare.mitigationId       = oMR.mitigationId;
                oSpare.mitigationNumber   = oMR.mitigationNumber;
                oSpare.employeeName       = oMR.employeeName;

                // Update linked asset status
                var oAsset = oData.assets.find(function (a) { return a.assetTag === oMR.assetTag; });
                if (oAsset) { oAsset.status = "InMitigation"; }

                oData.kpis.pendingApprovals  = Math.max(0, oData.kpis.pendingApprovals - 1);
                oData.kpis.activeMitigations = oData.mitigationRequests.filter(function (m) { return m.status === "Issued"; }).length;
                oData.kpis.availableSpares   = oData.sparePool.filter(function (s) { return s.availabilityStatus === "Available"; }).length;

                oModel.refresh(true);
                oDialog.close();
                MessageToast.show("Mitigation " + oMR.mitigationNumber + " approved. Spare " + oSpare.assetTag + " allocated.");
            }
        },

        _openRejectionDialog: function () {
            var oMR = this._oCurrentMR;
            var oTextArea = new TextArea({
                placeholder: "Provide reason for rejection…",
                width: "100%",
                rows: 4
            });

            var that = this;
            var oDialog = new Dialog({
                title: "Reject Mitigation — " + oMR.mitigationNumber,
                contentWidth: "440px",
                content: [
                    new VBox({ renderType: "Bare" }).addItem(
                        new Label({ text: "Rejection Reason (required):", design: "Bold", class: "mb025" })
                    ).addItem(oTextArea)
                ],
                beginButton: new Button({
                    text: "Confirm Rejection",
                    type: "Reject",
                    press: function () {
                        var sReason = oTextArea.getValue().trim();
                        if (!sReason) { MessageToast.show("Please provide a rejection reason"); return; }
                        that._confirmRejection(sReason, oDialog);
                    }
                }),
                endButton: new Button({ text: "Cancel", press: function () { oDialog.close(); } }),
                afterClose: function () { oDialog.destroy(); }
            });

            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        _confirmRejection: function (sReason, oDialog) {
            var oModel = this.getOwnerComponent().getModel();
            var oData  = oModel.getData();
            var oMR    = oData.mitigationRequests.find(function (m) { return m.mitigationId === this._oCurrentMR.mitigationId; }, this);

            if (oMR) {
                oMR.approvalStatus  = "Rejected";
                oMR.status          = "Closed";
                oMR.approverId      = "ADMIN01";
                oMR.approverName    = "IT Admin";
                oMR.rejectionReason = sReason;

                oData.kpis.pendingApprovals = Math.max(0, oData.kpis.pendingApprovals - 1);
                oModel.refresh(true);
                oDialog.close();
                MessageToast.show("Mitigation " + oMR.mitigationNumber + " rejected.");
            }
        },

        // ── All Requests Tab ─────────────────────────────────────────

        onMRSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue") || "";
            this._applyMRFilters(sQuery);
        },

        onMRFilterChange: function () {
            var sQuery = this.byId("mrSearchField").getValue();
            this._applyMRFilters(sQuery);
        },

        onClearMRFilters: function () {
            this.byId("mrSearchField").setValue("");
            this.byId("mrStatusFilter").setSelectedKey("");
            this.byId("mrImpactFilter").setSelectedKey("");
            this.byId("allMRTable").getBinding("items").filter([]);
        },

        _applyMRFilters: function (sQuery) {
            var aFilters = [];
            var sStatus = this.byId("mrStatusFilter").getSelectedKey();
            var sImpact = this.byId("mrImpactFilter").getSelectedKey();

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("mitigationNumber", FilterOperator.Contains, sQuery),
                        new Filter("employeeName",     FilterOperator.Contains, sQuery),
                        new Filter("assetTag",         FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            if (sStatus) { aFilters.push(new Filter("status",         FilterOperator.EQ, sStatus)); }
            if (sImpact) { aFilters.push(new Filter("businessImpact", FilterOperator.EQ, sImpact)); }

            this.byId("allMRTable").getBinding("items").filter(aFilters);
        },

        onMRRowPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            this._showMRDetail(oCtx.getObject());
        },

        onMarkReturned: function (oEvent) {
            oEvent.stopPropagation();
            var oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            var oMR  = oCtx.getObject();
            var that = this;

            MessageBox.confirm(
                "Mark replacement asset " + (oMR.spareAssetTag || "") + " as returned by " + oMR.employeeName + "?",
                {
                    title: "Confirm Return",
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            that._processReturn(oMR);
                        }
                    }
                }
            );
        },

        _processReturn: function (oMR) {
            var oModel = this.getOwnerComponent().getModel();
            var oData  = oModel.getData();
            var oMRData = oData.mitigationRequests.find(function (m) { return m.mitigationId === oMR.mitigationId; });
            var oSpare  = oData.sparePool.find(function (s) { return s.poolId === oMR.sparePoolId; });

            if (oMRData) {
                oMRData.returnedOn = new Date().toISOString();
                oMRData.status     = "Returned";
            }
            if (oSpare) {
                oSpare.availabilityStatus = "Available";
                oSpare.mitigationId       = null;
                oSpare.mitigationNumber   = null;
                oSpare.employeeName       = null;
            }

            oData.kpis.activeMitigations = oData.mitigationRequests.filter(function (m) { return m.status === "Issued"; }).length;
            oData.kpis.availableSpares   = oData.sparePool.filter(function (s) { return s.availabilityStatus === "Available"; }).length;

            oModel.refresh(true);
            MessageToast.show("Replacement returned. Spare pool updated.");
        },

        _showMRDetail: function (oMR) {
            var that = this;
            var oDialog = new Dialog({
                title: "Mitigation Request — " + oMR.mitigationNumber,
                contentWidth: "560px",
                content: [
                    new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "MR Number", design: "Bold" })).addItem(new Label({ text: oMR.mitigationNumber }))
                    ).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Status", design: "Bold" })).addItem(new ObjectStatus({ text: oMR.status, state: formatter.mrStatusToState(oMR.status) }))
                    ).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Approval", design: "Bold" })).addItem(new ObjectStatus({ text: oMR.approvalStatus, state: formatter.approvalStatusToState(oMR.approvalStatus) }))
                    ).addItem(
                        new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Business Impact", design: "Bold" })).addItem(new ObjectStatus({ text: oMR.businessImpact, state: formatter.impactToState(oMR.businessImpact) }))
                    ),
                    new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Employee", design: "Bold" })).addItem(new Label({ text: oMR.employeeName + " (" + oMR.department + ")" }))
                    ).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Linked Repair", design: "Bold" })).addItem(new Label({ text: oMR.linkedRepairNumber }))
                    ).addItem(
                        new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Asset Under Repair", design: "Bold" })).addItem(new Label({ text: oMR.assetTag + " (" + oMR.assetType + ")" }))
                    ),
                    new VBox({ renderType: "Bare", class: "mb1" }).addItem(new Label({ text: "Urgency Reason", design: "Bold", class: "mb025" })).addItem(new Text({ text: oMR.urgencyReason })),
                    new HBox({ renderType: "Bare", class: "mb1", wrap: "Wrap" }).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Raised On", design: "Bold" })).addItem(new Label({ text: formatter.formatDateTime(oMR.raisedOn) }))
                    ).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Spare Allocated", design: "Bold" })).addItem(new Label({ text: oMR.spareAssetTag || "—" }))
                    ).addItem(
                        new VBox({ renderType: "Bare", class: "mr1" }).addItem(new Label({ text: "Issued On", design: "Bold" })).addItem(new Label({ text: formatter.formatDateTime(oMR.issuedOn) }))
                    ).addItem(
                        new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Return Due", design: "Bold" })).addItem(new Label({ text: formatter.formatDate(oMR.returnDueDate) }))
                    ),
                    oMR.rejectionReason ? new VBox({ renderType: "Bare" }).addItem(new Label({ text: "Rejection Reason", design: "Bold", class: "mb025" })).addItem(new Text({ text: oMR.rejectionReason, class: "textError" })) : new HBox()
                ],
                buttons: [new Button({ text: "Close", press: function () { oDialog.close(); } })],
                afterClose: function () { oDialog.destroy(); }
            });

            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        onRefresh: function () {
            MessageToast.show("Mitigation inbox refreshed");
        }
    });
});
