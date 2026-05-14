sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "com/wipro/earmms/itadmin/app/earmmsitadminapp/model/mockData"
], function (JSONModel, Device, MockData) {
    "use strict";

    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createMockDataModel: function () {
            var oModel = new JSONModel(MockData.getData());
            oModel.setDefaultBindingMode("TwoWay");
            return oModel;
        }
    };
});
