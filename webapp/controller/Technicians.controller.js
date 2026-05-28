sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/HTML",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/formatter"
], function (Controller, HTML, MessageToast, Dialog, Button, formatter) {
    "use strict";

    return Controller.extend("com.wipro.earmms.itadmin.app.earmmsitadminapp.controller.Technicians", {
        formatter: formatter,

        onInit: function () {},

        onTechPress: function (oEvent) {
            var oCtx  = oEvent.getSource().getBindingContext();
            if (!oCtx) { return; }
            var oTech = oCtx.getObject();
            var oData = this.getOwnerComponent().getModel().getData();

            var s  = function (v) { return (v != null && v !== "") ? String(v) : "—"; };
            var sc = { Success: "#16a34a", Warning: "#d97706", Error: "#dc2626", Information: "#2563eb", None: "#64748b" };
            var col = function (state) { return sc[state] || "#334155"; };

            var aTickets = (oData.repairRequests || []).filter(function (r) {
                return r.technicianId === oTech.technicianId && ["Assigned", "InProgress"].indexOf(r.status) > -1;
            });

            var pct       = formatter.loadToPercent(oTech.currentLoad, oTech.maxLoad);
            var loadState = formatter.loadToState(oTech.currentLoad, oTech.maxLoad);
            var loadLabel = oTech.currentLoad >= oTech.maxLoad ? "Fully Loaded"
                          : oTech.currentLoad >= 3           ? "High Load"
                          : oTech.currentLoad >= 1           ? "Available"
                          : "Free";

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

            var sTicketRows = aTickets.length > 0
                ? aTickets.map(function (r) {
                    var sState   = formatter.rrStatusToState(r.status);
                    var sSevState = formatter.severityToState(r.severity);
                    var sStatusColor = sc[sState]   || "#64748b";
                    var sSevColor    = sc[sSevState] || "#64748b";
                    return '<div class="techTicketRow">' +
                        '<span class="techTicketRR">' + s(r.requestNumber) + '</span>' +
                        '<span class="techTicketMeta">' + s(r.assetTag) + (r.assetType ? " · " + r.assetType : "") + '</span>' +
                        '<span class="techTicketBadge" style="color:' + sStatusColor + ';background:' + sStatusColor + '18;border:1px solid ' + sStatusColor + '40">' + s(r.status) + '</span>' +
                        '<span class="techTicketBadge" style="color:' + sSevColor + ';background:' + sSevColor + '18;border:1px solid ' + sSevColor + '40">' + s(r.severity) + '</span>' +
                        '</div>';
                  }).join("")
                : '<div class="techNoTickets">No active tickets assigned</div>';

            var sHtml = '<div class="dlgBody">' +
                sec("Profile",
                    '<div class="dlgSBRow">' +
                    sb("Technician ID",  oTech.technicianId,  "#2563eb")        +
                    sb("Specialization", oTech.specialization, "#334155")       +
                    sb("Load",           oTech.currentLoad + " / " + oTech.maxLoad + " tickets", col(loadState)) +
                    sb("Status",         loadLabel,           col(loadState))   +
                    '</div>') +
                sec("Contact",
                    '<div class="dlgFRow">' +
                    fi("Email", oTech.email)  +
                    fi("Phone", oTech.phone)  +
                    fi("Utilization", pct + "%") +
                    '</div>') +
                sec("Active Tickets (" + aTickets.length + ")", sTicketRows) +
                '</div>';

            var oDialog = new Dialog({
                title: "Technician Profile — " + s(oTech.name),
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
            MessageToast.show("Technician data refreshed");
        }
    });
});
