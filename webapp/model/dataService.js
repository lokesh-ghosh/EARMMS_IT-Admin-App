sap.ui.define([], function () {
    "use strict";

    // =========================================================================
    // CONFIGURATION — update these after checking $metadata:
    // GET https://99a4398ctrial-dev-earmms-srv.cfapps.us10-001.hana.ondemand.com/$metadata
    //
    // 1. Update SERVICE_BASE_PATH with the actual service name from $metadata
    // 2. Update ENTITY_SETS if CAP uses different names (e.g. "RepairRequest" vs "RepairRequests")
    // 3. Update KEY_FIELDS if CAP uses "ID" (UUID) instead of semantic keys
    // =========================================================================

    var SERVICE_BASE_PATH = "/odata/v4/earmms";

    var ENTITY_SETS = {
        repairRequests:    "RepairRequest",
        assets:            "Asset",
        sparePool:         "SpareAssetPool",
        mitigationRequests:"MitigationRequest",
        technicians:       "Technician",
        employees:         "Employee",
        assetTypes:        "AssetType",
        slaConfig:         "SLAConfiguration"
    };

    var KEY_FIELDS = {
        repairRequests:    "requestId",
        assets:            "assetId",
        sparePool:         "poolId",
        mitigationRequests:"mitigationId",
        technicians:       "technicianId",
        employees:         "employeeId",
        assetTypes:        "typeId",
        slaConfig:         "configId"
    };

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    function _collectionUrl(sEntitySet) {
        return SERVICE_BASE_PATH + "/" + sEntitySet;
    }

    function _entityUrl(sEntitySet, sKey) {
        return SERVICE_BASE_PATH + "/" + sEntitySet + "('" + sKey + "')";
    }

    function _unwrapCollection(oResponse) {
        return oResponse.json().then(function (oJson) {
            return oJson.value || [];
        });
    }

    function _patch(sUrl, oPayload) {
        return fetch(sUrl, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept":       "application/json"
            },
            body: JSON.stringify(oPayload)
        }).then(function (oResponse) {
            if (!oResponse.ok) {
                return oResponse.text().then(function (sBody) {
                    throw new Error("PATCH " + sUrl + " failed [" + oResponse.status + "]: " + sBody);
                });
            }
            return oResponse;
        });
    }

    // =========================================================================
    // KPI COMPUTATION — derived client-side from fetched data
    // =========================================================================

    function _computeKpis(oData) {
        var aRR     = oData.repairRequests     || [];
        var aMR     = oData.mitigationRequests || [];
        var aSpares = oData.sparePool          || [];
        var aAssets = oData.assets             || [];

        var aActiveStatuses = ["Open", "Assigned", "InProgress"];
        var iResolved = aRR.filter(function (r) {
            return r.status === "Resolved" || r.status === "Closed";
        }).length;
        var iSLACompliant = aRR.filter(function (r) {
            return (r.status === "Resolved" || r.status === "Closed") && r.slaStatus !== "Breached";
        }).length;
        var iSLADenom = iResolved || 1;

        var aWithResolution = aRR.filter(function (r) { return r.actualResolution && r.raisedOn; });
        var fMTTR = 0;
        if (aWithResolution.length > 0) {
            var fTotalHours = aWithResolution.reduce(function (sum, r) {
                return sum + (new Date(r.actualResolution) - new Date(r.raisedOn)) / 3600000;
            }, 0);
            fMTTR = Math.round((fTotalHours / aWithResolution.length) * 10) / 10;
        }

        return {
            openTickets:       aRR.filter(function (r) { return aActiveStatuses.indexOf(r.status) > -1; }).length,
            pendingApprovals:  aMR.filter(function (m) { return m.approvalStatus === "Pending"; }).length,
            activeMitigations: aMR.filter(function (m) { return m.status === "Issued"; }).length,
            availableSpares:   aSpares.filter(function (s) { return s.availabilityStatus === "Available"; }).length,
            slaCompliance:     Math.round((iSLACompliant / iSLADenom) * 100),
            mttr:              fMTTR,
            breachedCount:     aRR.filter(function (r) { return r.slaStatus === "Breached"; }).length,
            atRiskCount:       aRR.filter(function (r) { return r.slaStatus === "AtRisk"; }).length,
            totalAssets:       aAssets.length
        };
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    return {

        /**
         * Fetch all entity sets in parallel.
         * Returns a Promise resolving to an object with the same shape as
         * mockData.getData(), plus a client-computed `kpis` block.
         */
        fetchAllData: function () {
            var aFetches = Object.keys(ENTITY_SETS).map(function (sKey) {
                return fetch(_collectionUrl(ENTITY_SETS[sKey]), { headers: { "Accept": "application/json" } })
                    .then(function (oResp) {
                        if (!oResp.ok) {
                            throw new Error("Fetch " + ENTITY_SETS[sKey] + " failed [" + oResp.status + "]");
                        }
                        return _unwrapCollection(oResp);
                    })
                    .then(function (aData) { return { key: sKey, data: aData }; });
            });

            return Promise.all(aFetches).then(function (aResults) {
                var oData = {};
                aResults.forEach(function (oResult) { oData[oResult.key] = oResult.data; });
                oData.kpis = _computeKpis(oData);
                return oData;
            });
        },

        /**
         * Re-fetch a single entity set (used after writes to re-sync if needed).
         */
        fetchEntitySet: function (sEntitySetKey) {
            var sEntitySet = ENTITY_SETS[sEntitySetKey];
            if (!sEntitySet) { return Promise.reject(new Error("Unknown entity set key: " + sEntitySetKey)); }
            return fetch(_collectionUrl(sEntitySet), { headers: { "Accept": "application/json" } })
                .then(function (oResp) {
                    if (!oResp.ok) { throw new Error("Fetch " + sEntitySet + " failed [" + oResp.status + "]"); }
                    return _unwrapCollection(oResp);
                });
        },

        // ── Write operations ──────────────────────────────────────────────────

        patchAssignTechnician: function (sRRId, sTechId, sTechName, iNewTechLoad) {
            return Promise.all([
                _patch(_entityUrl(ENTITY_SETS.repairRequests, sRRId), {
                    status: "Assigned",
                    technicianId:   sTechId,
                    technicianName: sTechName
                }),
                _patch(_entityUrl(ENTITY_SETS.technicians, sTechId), {
                    currentLoad: iNewTechLoad
                })
            ]);
        },

        patchApproveMitigation: function (sMRId, oMRPayload, sSparePoolId, oSparePayload, sAssetId, oAssetPayload) {
            var aPatches = [
                _patch(_entityUrl(ENTITY_SETS.mitigationRequests, sMRId),   oMRPayload),
                _patch(_entityUrl(ENTITY_SETS.sparePool,          sSparePoolId), oSparePayload)
            ];
            if (sAssetId && oAssetPayload) {
                aPatches.push(_patch(_entityUrl(ENTITY_SETS.assets, sAssetId), oAssetPayload));
            }
            return Promise.all(aPatches);
        },

        patchRejectMitigation: function (sMRId, oPayload) {
            return _patch(_entityUrl(ENTITY_SETS.mitigationRequests, sMRId), oPayload);
        },

        patchProcessReturn: function (sMRId, oMRPayload, sSparePoolId, oSparePayload) {
            return Promise.all([
                _patch(_entityUrl(ENTITY_SETS.mitigationRequests, sMRId),        oMRPayload),
                _patch(_entityUrl(ENTITY_SETS.sparePool,          sSparePoolId), oSparePayload)
            ]);
        },

        patchReleaseReservation: function (sSparePoolId, oPayload) {
            return _patch(_entityUrl(ENTITY_SETS.sparePool, sSparePoolId), oPayload);
        },

        computeKpis: _computeKpis,

        // Exposed for debugging
        SERVICE_BASE_PATH: SERVICE_BASE_PATH,
        ENTITY_SETS:       ENTITY_SETS,
        KEY_FIELDS:        KEY_FIELDS
    };
});
