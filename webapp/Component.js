sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/models"
], function (UIComponent, Device, models) {
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
            this.setModel(models.createMockDataModel());
        }
    });
});
