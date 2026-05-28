sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/models",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/dataService"
], function (UIComponent, Device, models, dataService) {
    "use strict";

    return UIComponent.extend("com.wipro.earmms.itadmin.app.earmmsitadminapp.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(models.createDeviceModel(), "device");

            var oModel = models.createLiveDataModel();
            this.setModel(oModel);
            this._loadLiveData(oModel);
        },

        _loadLiveData: function (oModel) {
            oModel.setProperty("/loading", true);
            oModel.setProperty("/error",   null);

            dataService.fetchAllData()
                .then(function (oData) {
                    oData.loading = false;
                    oData.error   = null;
                    oModel.setData(oData);
                })
                .catch(function (oErr) {
                    oModel.setProperty("/loading", false);
                    oModel.setProperty("/error",   oErr.message || String(oErr));
                    sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                        MessageBox.error(
                            "Could not load data from the EARMMS service.\n\n" +
                            "Error: " + (oErr.message || oErr) + "\n\n" +
                            "Please check your network connection and try refreshing.",
                            { title: "Data Load Failed" }
                        );
                    });
                });
        }
    });
});
