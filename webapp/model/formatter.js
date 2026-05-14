sap.ui.define([], function () {
    "use strict";

    return {
        // ── Status → ValueState ─────────────────────────────────────
        rrStatusToState: function (s) {
            return { Open: "Information", Assigned: "Warning", InProgress: "Warning", Resolved: "Success", Closed: "None" }[s] || "None";
        },
        mrStatusToState: function (s) {
            return { Requested: "Warning", Approved: "Success", Issued: "Information", Returned: "Success", Closed: "None" }[s] || "None";
        },
        approvalStatusToState: function (s) {
            return { Pending: "Warning", Approved: "Success", Rejected: "Error" }[s] || "None";
        },
        slaToState: function (s) {
            return { OnTrack: "Success", AtRisk: "Warning", Breached: "Error" }[s] || "None";
        },
        severityToState: function (s) {
            return { High: "Error", Medium: "Warning", Low: "Success" }[s] || "None";
        },
        spareStatusToState: function (s) {
            return { Available: "Success", Reserved: "Warning", InUse: "Error" }[s] || "None";
        },
        assetStatusToState: function (s) {
            return { Active: "Success", UnderRepair: "Warning", InMitigation: "Error", Retired: "None" }[s] || "None";
        },
        impactToState: function (s) {
            return { Critical: "Error", High: "Warning", Medium: "Information" }[s] || "None";
        },

        // ── Technician load ─────────────────────────────────────────
        loadToPercent: function (n, m) {
            return Math.round(((n || 0) / (m || 5)) * 100);
        },
        loadToState: function (n, m) {
            var pct = Math.round(((n || 0) / (m || 5)) * 100);
            if (pct >= 80) { return "Error"; }
            if (pct >= 50) { return "Warning"; }
            return "Success";
        },

        // ── Date / time ─────────────────────────────────────────────
        formatDate: function (s) {
            if (!s) { return "—"; }
            var d = new Date(s);
            return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        },
        formatDateTime: function (s) {
            if (!s) { return "—"; }
            var d = new Date(s);
            return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
        },

        // ── Null / bool helpers ─────────────────────────────────────
        notAssigned: function (s) { return s ? s : "Not Assigned"; },
        nullDash:    function (s) { return s || "—"; },
        boolYesNo:   function (b) { return b ? "Yes" : "No"; },

        // ── Asset status counts (for Assets view summary tiles) ──────
        countAssetsActive: function (aAssets) {
            return (aAssets || []).filter(function (a) { return a.status === "Active"; }).length;
        },
        countAssetsUnderRepair: function (aAssets) {
            return (aAssets || []).filter(function (a) { return a.status === "UnderRepair"; }).length;
        },
        countAssetsInMitigation: function (aAssets) {
            return (aAssets || []).filter(function (a) { return a.status === "InMitigation"; }).length;
        },
        countAssetsRetired: function (aAssets) {
            return (aAssets || []).filter(function (a) { return a.status === "Retired"; }).length;
        },

        // ── Spare pool status counts (for SparePool view tiles) ──────
        countSpareReserved: function (aPool) {
            return (aPool || []).filter(function (s) { return s.availabilityStatus === "Reserved"; }).length;
        },
        countSpareInUse: function (aPool) {
            return (aPool || []).filter(function (s) { return s.availabilityStatus === "InUse"; }).length;
        },

        // ── Technician workload aggregates (for Technicians summary) ─
        sumTechLoad: function (aTechs) {
            return (aTechs || []).reduce(function (s, t) { return s + (t.currentLoad || 0); }, 0);
        },
        sumTechCapacity: function (aTechs) {
            return (aTechs || []).reduce(function (s, t) { return s + ((t.maxLoad || 0) - (t.currentLoad || 0)); }, 0);
        },
        avgTechUtilization: function (aTechs) {
            if (!aTechs || aTechs.length === 0) { return "0%"; }
            var total = aTechs.reduce(function (s, t) { return s + ((t.currentLoad || 0) / (t.maxLoad || 5)); }, 0);
            return Math.round((total / aTechs.length) * 100) + "%";
        },

        // ── Technician avatar ────────────────────────────────────────
        techInitials: function (sName) {
            if (!sName) { return "?"; }
            return sName.split(" ").map(function (n) { return n.charAt(0); }).join("").substring(0, 2).toUpperCase();
        },
        techColor: function (sName) {
            if (!sName) { return "Accent1"; }
            var aColors = ["Accent1", "Accent2", "Accent3", "Accent4", "Accent5", "Accent6"];
            var n = (sName.charCodeAt(0) || 0) + (sName.length > 1 ? sName.charCodeAt(1) : 0);
            return aColors[Math.abs(n) % 6];
        },

        // ── Active tickets summary for a technician ──────────────────
        // parts: [{path:'/repairRequests'}, {path:'technicianId'}]
        activeTicketsSummary: function (aRR, sTechId) {
            if (!aRR || !sTechId) { return "No active tickets"; }
            var aActive = aRR.filter(function (r) {
                return r.technicianId === sTechId && ["Assigned", "InProgress"].indexOf(r.status) > -1;
            });
            if (aActive.length === 0) { return "No active tickets"; }
            return aActive.map(function (r) { return r.requestNumber + " (" + r.status + ")"; }).join(" · ");
        }
    };
});
