sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/mvc/XMLView",
    "sap/m/MessageToast"
], function (Controller, XMLView, MessageToast) {
    "use strict";

    var SECTION_MAP = {
        dashboard:       "Dashboard",
        repairRequests:  "RepairRequests",
        mitigationInbox: "MitigationInbox",
        sparePool:       "SparePool",
        assets:          "Assets",
        technicians:     "Technicians"
    };

    return Controller.extend("com.wipro.earmms.itadmin.app.earmmsitadminapp.controller.App", {

        onInit: function () {
            this._oLoadedViews = {};
            this._sCurrentKey  = null;

            var oEventBus = this.getOwnerComponent().getEventBus();
            oEventBus.subscribe("App", "Navigate", this._onExternalNavigate, this);

            this._loadSection("dashboard");
        },

        onExit: function () {
            this.getOwnerComponent().getEventBus().unsubscribe("App", "Navigate", this._onExternalNavigate, this);
        },

        onToggleNav: function () {
            var oPage = this.byId("toolPage");
            oPage.setSideExpanded(!oPage.getSideExpanded());
        },

        onRefresh: function () {
            var sKey = this._sCurrentKey;
            var oCachedView = sKey && this._oLoadedViews[sKey];
            if (oCachedView && oCachedView.getController && oCachedView.getController().onRefresh) {
                oCachedView.getController().onRefresh();
            } else {
                MessageToast.show("Data refreshed");
            }
        },

        onNavItemSelect: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            if (sKey === "about") {
                this._showAbout();
                return;
            }
            this._loadSection(sKey);
        },

        _onExternalNavigate: function (sChannel, sEvent, oData) {
            if (oData && oData.key) {
                this._loadSection(oData.key);
                this._updateSideNavSelection(oData.key);
            }
        },

        _loadSection: function (sKey) {
            var sViewName = SECTION_MAP[sKey];
            if (!sViewName) { return; }

            this._sCurrentKey = sKey;
            var oContainer = this.byId("contentContainer");
            var oComponent = this.getOwnerComponent();
            var that = this;

            // If already loaded, just swap the displayed view
            if (this._oLoadedViews[sKey]) {
                oContainer.removeAllItems();
                oContainer.addItem(this._oLoadedViews[sKey]);
                return;
            }

            // Create and cache the view
            oComponent.runAsOwner(function () {
                XMLView.create({
                    viewName: "com.wipro.earmms.itadmin.app.earmmsitadminapp.view." + sViewName
                }).then(function (oView) {
                    // Explicitly propagate component models so bindings survive remove/re-add
                    oView.setModel(oComponent.getModel());
                    oView.setModel(oComponent.getModel("device"), "device");
                    oView.setModel(oComponent.getModel("i18n"), "i18n");

                    that._oLoadedViews[sKey] = oView;
                    oContainer.removeAllItems();
                    oContainer.addItem(oView);
                }).catch(function (oErr) {
                    console.error("Failed to load view: " + sViewName, oErr);
                    MessageToast.show("Could not load " + sViewName + " — check console");
                });
            });
        },

        _updateSideNavSelection: function (sKey) {
            var oSideNav = this.byId("sideNav");
            if (oSideNav && oSideNav.setSelectedKey) {
                oSideNav.setSelectedKey(sKey);
            }
        },

        _showAbout: function () {
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                MessageBox.information(
                    "Enterprise Asset Repair & Mitigation Management System\n\nVersion: 1.0.0 (Phase 1 MVP)\nPlatform: SAP BTP – Cloud Foundry\nUI Framework: SAPUI5 / Fiori 3\n\nDeveloped by Wipro Engineering",
                    { title: "About EARMMS" }
                );
            });
        }
    });
});
