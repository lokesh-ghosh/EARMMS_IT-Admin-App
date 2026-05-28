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
        },

        createLiveDataModel: function () {
            var oModel = new JSONModel({
                repairRequests:    [],
                assets:            [],
                sparePool:         [],
                mitigationRequests:[],
                technicians:       [],
                employees:         [],
                assetTypes:        [],
                slaConfig:         [],
                kpis: {
                    openTickets: 0, pendingApprovals: 0, activeMitigations: 0,
                    availableSpares: 0, slaCompliance: 0, mttr: 0,
                    breachedCount: 0, atRiskCount: 0, totalAssets: 0
                },
                loading: true,
                error:   null
            });
            oModel.setDefaultBindingMode("TwoWay");
            oModel.setSizeLimit(500);
            return oModel;
        }
    };
});
