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
    "sap/m/TextArea",
    "sap/m/Text",
    "sap/m/ObjectStatus",
    "sap/ui/core/Item",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/dataService"
], function (Controller, HTML, Filter, FilterOperator, MessageToast, MessageBox,
    Dialog, Button, VBox, HBox, Label, Select, TextArea, Text, ObjectStatus, Item, formatter, dataService) {
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
            var s   = function (v) { return (v != null && v !== "") ? String(v) : "—"; };
            var oData = this.getOwnerComponent().getModel().getData();
            var aAvailableSpares = (oData.sparePool || []).filter(function (sp) {
                return sp.availabilityStatus === "Available";
            });

            var impState = formatter.impactToState(oMR.businessImpact);
            var impColors = { Success: "#16a34a", Warning: "#d97706", Error: "#dc2626", Information: "#2563eb", None: "#64748b" };
            var impColor  = impColors[impState] || "#64748b";

            var empStr   = [oMR.employeeName, oMR.department ? "· " + oMR.department : ""].filter(Boolean).join(" ") || "—";
            var assetStr = [oMR.assetTag, oMR.assetType ? "(" + oMR.assetType + ")" : ""].filter(Boolean).join(" ") || "—";

            var sInfoHtml =
                '<div class="dlgContextBar">' +
                    '<span class="dlgContextBarValue" style="color:#2563eb">' + s(oMR.mitigationNumber) + '</span>' +
                    '<span class="dlgContextBarDivider">|</span>' +
                    '<span class="dlgContextBarLabel">Employee:</span><span class="dlgContextBarValue">' + s(empStr) + '</span>' +
                    '<span class="dlgContextBarDivider">|</span>' +
                    '<span class="dlgContextBarLabel">Asset:</span><span class="dlgContextBarValue">' + s(assetStr) + '</span>' +
                    '<span class="dlgContextBarDivider">|</span>' +
                    '<span class="dlgContextBarValue" style="color:' + impColor + '">' + s(oMR.businessImpact) + '</span>' +
                '</div>' +
                (oMR.urgencyReason ?
                    '<div class="dlgUrgencyHtml" style="margin-bottom:1rem">' + s(oMR.urgencyReason) + '</div>' : '');

            var oSelect = new Select({
                width: "100%",
                forceSelection: false,
                placeholder: "Choose a replacement asset…"
            });
            aAvailableSpares.forEach(function (sp) {
                var sTag  = sp.assetTag  || sp.assetId || "—";
                var sType = sp.typeName  || sp.assetType || "—";
                var sMake = [sp.make, sp.model].filter(Boolean).join(" ") || "";
                oSelect.addItem(new Item({ key: sp.poolId, text: sTag + "  ·  " + sType + (sMake ? "  (" + sMake + ")" : "") }));
            });

            var oContent = new VBox({ renderType: "Bare" });
            oContent.addItem(new HTML({ content: sInfoHtml }));
            oContent.addItem(new Label({
                text: "Select Replacement Asset  (" + aAvailableSpares.length + " available)",
                class: "dlgSectionTitle"
            }));
            oContent.addItem(
                aAvailableSpares.length > 0 ? oSelect :
                    new Label({ text: "No spare assets currently available.", class: "textError textBold" })
            );

            var that = this;
            var oDialog = new Dialog({
                title: "Approve Mitigation — " + s(oMR.mitigationNumber),
                contentWidth: "500px",
                content: [oContent],
                beginButton: new Button({
                    text: "Confirm Approval",
                    type: "Accept",
                    icon: "sap-icon://accept",
                    enabled: aAvailableSpares.length > 0,
                    press: function () {
                        var sSpareKey = oSelect.getSelectedKey();
                        if (!sSpareKey) { MessageToast.show("Please select a spare asset to allocate"); return; }
                        that._confirmApproval(sSpareKey, oDialog);
                    }
                }),
                endButton: new Button({ text: "Cancel", icon: "sap-icon://cancel", press: function () { oDialog.close(); } }),
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
                var sNow       = new Date().toISOString();
                var sReturnDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

                oMR.approvalStatus   = "Approved";
                oMR.status           = "Issued";
                oMR.approverId       = "ADMIN01";
                oMR.approverName     = "IT Admin";
                oMR.sparePoolId      = sSparePoolId;
                oMR.spareAssetTag    = oSpare.assetTag;
                oMR.issuedOn         = sNow;
                oMR.returnDueDate    = sReturnDue;

                oSpare.availabilityStatus = "InUse";
                oSpare.mitigationId       = oMR.mitigationId;
                oSpare.mitigationNumber   = oMR.mitigationNumber;
                oSpare.employeeName       = oMR.employeeName;

                var oAsset = oData.assets.find(function (a) { return a.assetTag === oMR.assetTag; });
                if (oAsset) { oAsset.status = "InMitigation"; }

                oData.kpis = dataService.computeKpis(oData);
                oModel.refresh(true);
                oDialog.close();
                MessageToast.show("Mitigation " + oMR.mitigationNumber + " approved. Spare " + oSpare.assetTag + " allocated.");

                var oMRPayload = {
                    approvalStatus: "Approved", status: "Issued",
                    approverId: "ADMIN01", approverName: "IT Admin",
                    sparePoolId: sSparePoolId, spareAssetTag: oSpare.assetTag,
                    issuedOn: sNow, returnDueDate: sReturnDue
                };
                var oSparePayload = {
                    availabilityStatus: "InUse",
                    mitigationId: oMR.mitigationId,
                    mitigationNumber: oMR.mitigationNumber,
                    employeeName: oMR.employeeName
                };
                var sAssetId    = oAsset ? oAsset.assetId : null;
                var oAssetPayload = oAsset ? { status: "InMitigation" } : null;

                dataService.patchApproveMitigation(
                    oMR.mitigationId, oMRPayload,
                    sSparePoolId, oSparePayload,
                    sAssetId, oAssetPayload
                ).catch(function (oErr) {
                    MessageBox.warning(
                        "Approval saved locally but could not be persisted to the server.\n\nError: " + (oErr.message || oErr),
                        { title: "OData Write Failed" }
                    );
                });
            }
        },

        _openRejectionDialog: function () {
            var oMR = this._oCurrentMR;
            var s   = function (v) { return (v != null && v !== "") ? String(v) : "—"; };

            var impState  = formatter.impactToState(oMR.businessImpact);
            var impColors = { Success: "#16a34a", Warning: "#d97706", Error: "#dc2626", Information: "#2563eb", None: "#64748b" };
            var impColor  = impColors[impState] || "#64748b";

            var sInfoHtml =
                '<div class="dlgContextBar">' +
                    '<span class="dlgContextBarValue" style="color:#2563eb">' + s(oMR.mitigationNumber) + '</span>' +
                    '<span class="dlgContextBarDivider">|</span>' +
                    '<span class="dlgContextBarLabel">Requested by:</span><span class="dlgContextBarValue">' + s(oMR.employeeName) + '</span>' +
                    '<span class="dlgContextBarDivider">|</span>' +
                    '<span class="dlgContextBarValue" style="color:' + impColor + '">' + s(oMR.businessImpact) + ' Impact</span>' +
                '</div>' +
                '<div class="dlgWarnHtml" style="margin-bottom:1rem">This action is irreversible. The employee will be notified and the request will be closed.</div>';

            var oTextArea = new TextArea({
                placeholder: "Provide reason for rejection…",
                width: "100%",
                rows: 4
            });

            var oContent = new VBox({ renderType: "Bare" });
            oContent.addItem(new HTML({ content: sInfoHtml }));
            oContent.addItem(new Label({ text: "Rejection Reason (required)", class: "dlgSectionTitle" }));
            oContent.addItem(oTextArea);

            var that = this;
            var oDialog = new Dialog({
                title: "Reject Mitigation — " + s(oMR.mitigationNumber),
                contentWidth: "460px",
                content: [oContent],
                beginButton: new Button({
                    text: "Confirm Rejection",
                    type: "Reject",
                    icon: "sap-icon://decline",
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

                oData.kpis = dataService.computeKpis(oData);
                oModel.refresh(true);
                oDialog.close();
                MessageToast.show("Mitigation " + oMR.mitigationNumber + " rejected.");

                dataService.patchRejectMitigation(oMR.mitigationId, {
                    approvalStatus: "Rejected", status: "Closed",
                    approverId: "ADMIN01", approverName: "IT Admin",
                    rejectionReason: sReason
                }).catch(function (oErr) {
                    MessageBox.warning(
                        "Rejection saved locally but could not be persisted to the server.\n\nError: " + (oErr.message || oErr),
                        { title: "OData Write Failed" }
                    );
                });
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
            var oModel  = this.getOwnerComponent().getModel();
            var oData   = oModel.getData();
            var oMRData = oData.mitigationRequests.find(function (m) { return m.mitigationId === oMR.mitigationId; });
            var oSpare  = oData.sparePool.find(function (s) { return s.poolId === oMR.sparePoolId; });
            var sNow    = new Date().toISOString();

            if (oMRData) {
                oMRData.returnedOn = sNow;
                oMRData.status     = "Returned";
            }
            if (oSpare)  {
                oSpare.availabilityStatus = "Available";
                oSpare.mitigationId       = null;
                oSpare.mitigationNumber   = null;
                oSpare.employeeName       = null;
            }

            oData.kpis = dataService.computeKpis(oData);
            oModel.refresh(true);
            MessageToast.show("Replacement returned. Spare pool updated.");

            if (oMRData && oSpare) {
                dataService.patchProcessReturn(
                    oMR.mitigationId,
                    { returnedOn: sNow, status: "Returned" },
                    oMR.sparePoolId,
                    { availabilityStatus: "Available", mitigationId: null, mitigationNumber: null, employeeName: null }
                ).catch(function (oErr) {
                    MessageBox.warning(
                        "Return saved locally but could not be persisted to the server.\n\nError: " + (oErr.message || oErr),
                        { title: "OData Write Failed" }
                    );
                });
            }
        },

        _showMRDetail: function (oMR) {
            var s  = function (v) { return (v != null && v !== "") ? String(v) : "—"; };
            var sc = { Success: "#16a34a", Warning: "#d97706", Error: "#dc2626", Information: "#2563eb", None: "#64748b" };
            var col = function (state) { return sc[state] || "#64748b"; };

            var impState  = formatter.impactToState(oMR.businessImpact);
            var apprState = formatter.approvalStatusToState(oMR.approvalStatus);
            var mrState   = formatter.mrStatusToState(oMR.status);

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

            var empStr   = [oMR.employeeName, oMR.department ? "(" + oMR.department + ")" : ""].filter(Boolean).join(" ") || "—";
            var assetStr = [oMR.assetTag, oMR.assetType ? "(" + oMR.assetType + ")" : ""].filter(Boolean).join(" ") || "—";

            var sHtml = '<div class="dlgBody">' +
                sec("Summary",
                    '<div class="dlgSBRow">' +
                    sb("MR Number",      oMR.mitigationNumber, "#2563eb")               +
                    sb("Status",         oMR.status,           col(mrState))            +
                    sb("Approval",       oMR.approvalStatus,   col(apprState))          +
                    sb("Business Impact",oMR.businessImpact,   col(impState))           +
                    '</div>') +
                sec("Employee &amp; Asset",
                    '<div class="dlgFRow">' +
                    fi("Employee",           empStr)                      +
                    fi("Asset Under Repair", assetStr)                   +
                    fi("Linked Repair #",    oMR.linkedRepairNumber)     +
                    '</div>') +
                (oMR.urgencyReason ?
                    sec("Urgency Reason",
                        '<div class="dlgUrgencyHtml">' + s(oMR.urgencyReason) + '</div>') : "") +
                sec("Timeline &amp; Spare",
                    '<div class="dlgFRow">' +
                    fi("Raised On",       formatter.formatDateTime(oMR.raisedOn))    +
                    fi("Spare Allocated", oMR.spareAssetTag)                         +
                    fi("Issued On",       formatter.formatDateTime(oMR.issuedOn))    +
                    fi("Return Due",      formatter.formatDate(oMR.returnDueDate))   +
                    '</div>') +
                (oMR.rejectionReason ?
                    sec("Rejection Reason",
                        '<div class="dlgWarnHtml">' + s(oMR.rejectionReason) + '</div>') : "") +
                '</div>';

            var oDialog = new Dialog({
                title: "Mitigation Request — " + s(oMR.mitigationNumber),
                contentWidth: "580px",
                verticalScrolling: true,
                content: [new HTML({ content: sHtml })],
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
