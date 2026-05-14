sap.ui.define([], function () {
    "use strict";

    return {
        getData: function () {
            return {
                assetTypes: [
                    { typeId: "LAPTOP",   typeName: "Laptop",   category: "IT",          isCritical: true,  standardSLAHours: 4  },
                    { typeId: "MONITOR",  typeName: "Monitor",  category: "IT",          isCritical: false, standardSLAHours: 8  },
                    { typeId: "KEYBOARD", typeName: "Keyboard", category: "IT",          isCritical: false, standardSLAHours: 24 },
                    { typeId: "CHAIR",    typeName: "Chair",    category: "FURNITURE",   isCritical: false, standardSLAHours: 48 },
                    { typeId: "PHONE",    typeName: "IP Phone", category: "ELECTRONICS", isCritical: true,  standardSLAHours: 4  }
                ],

                employees: [
                    { employeeId: "EMP001", name: "Arjun Sharma",  email: "arjun.sharma@wipro.com",  department: "Engineering", designation: "Software Engineer",        managerId: "EMP003", isVIP: false },
                    { employeeId: "EMP002", name: "Priya Mehta",   email: "priya.mehta@wipro.com",   department: "Finance",     designation: "Senior Financial Analyst", managerId: "EMP004", isVIP: false },
                    { employeeId: "EMP003", name: "Vikram Nair",   email: "vikram.nair@wipro.com",   department: "Engineering", designation: "Engineering Manager",      managerId: null,     isVIP: true  },
                    { employeeId: "EMP004", name: "Sunita Rao",    email: "sunita.rao@wipro.com",    department: "Finance",     designation: "Finance Manager",          managerId: null,     isVIP: false },
                    { employeeId: "EMP005", name: "Rahul Gupta",   email: "rahul.gupta@wipro.com",   department: "HR",          designation: "HR Executive",             managerId: "EMP004", isVIP: false }
                ],

                technicians: [
                    { technicianId: "TECH001", name: "Amit Kumar",      email: "amit.kumar@wipro.com",      specialization: "Laptop",     currentLoad: 3, maxLoad: 5, phone: "+91-98765-43210" },
                    { technicianId: "TECH002", name: "Deepa Krishnan",  email: "deepa.krishnan@wipro.com",  specialization: "Networking", currentLoad: 2, maxLoad: 5, phone: "+91-98765-43211" },
                    { technicianId: "TECH003", name: "Ravi Shankar",    email: "ravi.shankar@wipro.com",    specialization: "Furniture",  currentLoad: 0, maxLoad: 5, phone: "+91-98765-43212" }
                ],

                assets: [
                    { assetId: "AST001", assetTag: "LAP-2026-0451", assetType: "LAPTOP",   typeName: "Laptop",   make: "Dell",         model: "Latitude 5420",        serialNumber: "SN-DL-001", purchaseDate: "2024-01-15", warrantyExpiry: "2027-01-15", ownerEmployeeId: "EMP001", ownerName: "Arjun Sharma", location: "Floor 3, Desk 12",  status: "UnderRepair"  },
                    { assetId: "AST002", assetTag: "LAP-2026-0452", assetType: "LAPTOP",   typeName: "Laptop",   make: "HP",           model: "EliteBook 840 G9",     serialNumber: "SN-HP-001", purchaseDate: "2023-06-20", warrantyExpiry: "2026-06-20", ownerEmployeeId: "EMP002", ownerName: "Priya Mehta",  location: "Floor 2, Desk 5",   status: "Active"       },
                    { assetId: "AST003", assetTag: "MON-2026-0101", assetType: "MONITOR",  typeName: "Monitor",  make: "Samsung",      model: "27\" FHD LF27T350",    serialNumber: "SN-SAM-01", purchaseDate: "2023-03-10", warrantyExpiry: "2026-03-10", ownerEmployeeId: "EMP003", ownerName: "Vikram Nair",  location: "Floor 1, Cabin 2",  status: "Active"       },
                    { assetId: "AST004", assetTag: "LAP-2026-0453", assetType: "LAPTOP",   typeName: "Laptop",   make: "Lenovo",       model: "ThinkPad X1 Carbon",   serialNumber: "SN-LV-001", purchaseDate: "2024-02-28", warrantyExpiry: "2027-02-28", ownerEmployeeId: "EMP004", ownerName: "Sunita Rao",   location: "Floor 2, Cabin 1",  status: "InMitigation" },
                    { assetId: "AST005", assetTag: "PHN-2026-0201", assetType: "PHONE",    typeName: "IP Phone", make: "Cisco",        model: "IP Phone 8861",        serialNumber: "SN-CS-001", purchaseDate: "2022-11-05", warrantyExpiry: "2025-11-05", ownerEmployeeId: "EMP005", ownerName: "Rahul Gupta",  location: "Floor 4, Desk 8",   status: "UnderRepair"  },
                    { assetId: "AST006", assetTag: "CHR-2026-0301", assetType: "CHAIR",    typeName: "Chair",    make: "Herman Miller", model: "Aeron Size B",         serialNumber: "SN-HM-001", purchaseDate: "2021-05-15", warrantyExpiry: "2028-05-15", ownerEmployeeId: "EMP001", ownerName: "Arjun Sharma", location: "Floor 3, Desk 12",  status: "Active"       },
                    { assetId: "AST007", assetTag: "LAP-2026-0454", assetType: "LAPTOP",   typeName: "Laptop",   make: "Apple",        model: "MacBook Pro 14 M3",    serialNumber: "SN-AP-001", purchaseDate: "2024-03-01", warrantyExpiry: "2027-03-01", ownerEmployeeId: "EMP003", ownerName: "Vikram Nair",  location: "Floor 1, Cabin 2",  status: "Active"       },
                    { assetId: "AST008", assetTag: "MON-2026-0102", assetType: "MONITOR",  typeName: "Monitor",  make: "LG",           model: "24\" QHD 24QN600",     serialNumber: "SN-LG-001", purchaseDate: "2023-08-15", warrantyExpiry: "2026-08-15", ownerEmployeeId: "EMP002", ownerName: "Priya Mehta",  location: "Floor 2, Desk 5",   status: "Active"       },
                    { assetId: "AST009", assetTag: "KEY-2026-0401", assetType: "KEYBOARD", typeName: "Keyboard", make: "Logitech",     model: "MX Keys Advanced",     serialNumber: "SN-LG-002", purchaseDate: "2023-09-20", warrantyExpiry: "2026-09-20", ownerEmployeeId: "EMP005", ownerName: "Rahul Gupta",  location: "Floor 4, Desk 8",   status: "UnderRepair"  },
                    { assetId: "AST010", assetTag: "LAP-2026-0455", assetType: "LAPTOP",   typeName: "Laptop",   make: "Dell",         model: "XPS 15 9530",          serialNumber: "SN-DL-002", purchaseDate: "2024-04-10", warrantyExpiry: "2027-04-10", ownerEmployeeId: null,     ownerName: "Unassigned",   location: "IT Store Room",     status: "Active"       }
                ],

                sparePool: [
                    { poolId: "SP001", assetTag: "SP-LAP-001", assetType: "LAPTOP",   typeName: "Laptop",   make: "Dell",    model: "Latitude 5520",     serialNumber: "SP-SN-001", availabilityStatus: "Available", mitigationId: null,   mitigationNumber: null,           employeeName: null          },
                    { poolId: "SP002", assetTag: "SP-LAP-002", assetType: "LAPTOP",   typeName: "Laptop",   make: "HP",      model: "ProBook 450 G9",    serialNumber: "SP-SN-002", availabilityStatus: "Reserved",  mitigationId: "MR001", mitigationNumber: "MR-2026-00001", employeeName: "Sunita Rao"   },
                    { poolId: "SP003", assetTag: "SP-MON-001", assetType: "MONITOR",  typeName: "Monitor",  make: "Samsung", model: "24\" FHD S24F350",  serialNumber: "SP-SN-003", availabilityStatus: "Available", mitigationId: null,   mitigationNumber: null,           employeeName: null          },
                    { poolId: "SP004", assetTag: "SP-PHN-001", assetType: "PHONE",    typeName: "IP Phone", make: "Cisco",   model: "IP Phone 8841",     serialNumber: "SP-SN-004", availabilityStatus: "InUse",     mitigationId: "MR002", mitigationNumber: "MR-2026-00002", employeeName: "Rahul Gupta"  },
                    { poolId: "SP005", assetTag: "SP-LAP-003", assetType: "LAPTOP",   typeName: "Laptop",   make: "Lenovo",  model: "ThinkPad E14 G4",   serialNumber: "SP-SN-005", availabilityStatus: "Available", mitigationId: null,   mitigationNumber: null,           employeeName: null          }
                ],

                repairRequests: [
                    {
                        requestId: "RR001", requestNumber: "RR-2026-00001",
                        assetId: "AST001", assetTag: "LAP-2026-0451", assetType: "Laptop", assetMake: "Dell", assetModel: "Latitude 5420",
                        employeeId: "EMP001", employeeName: "Arjun Sharma", department: "Engineering",
                        raisedOn: "2026-05-10T09:15:00",
                        issueCategory: "Hardware",
                        issueDescription: "Laptop screen flickers intermittently and sometimes goes completely black. Unable to perform any work.",
                        severity: "High", status: "Assigned",
                        technicianId: "TECH001", technicianName: "Amit Kumar",
                        expectedResolution: "2026-05-10T13:15:00", actualResolution: null, resolutionNotes: null,
                        slaStatus: "AtRisk"
                    },
                    {
                        requestId: "RR002", requestNumber: "RR-2026-00002",
                        assetId: "AST005", assetTag: "PHN-2026-0201", assetType: "IP Phone", assetMake: "Cisco", assetModel: "IP Phone 8861",
                        employeeId: "EMP005", employeeName: "Rahul Gupta", department: "HR",
                        raisedOn: "2026-05-11T10:30:00",
                        issueCategory: "Hardware",
                        issueDescription: "IP Phone not connecting to network. No dial tone and the display is not turning on.",
                        severity: "High", status: "InProgress",
                        technicianId: "TECH002", technicianName: "Deepa Krishnan",
                        expectedResolution: "2026-05-11T14:30:00", actualResolution: null, resolutionNotes: null,
                        slaStatus: "Breached"
                    },
                    {
                        requestId: "RR003", requestNumber: "RR-2026-00003",
                        assetId: "AST009", assetTag: "KEY-2026-0401", assetType: "Keyboard", assetMake: "Logitech", assetModel: "MX Keys Advanced",
                        employeeId: "EMP005", employeeName: "Rahul Gupta", department: "HR",
                        raisedOn: "2026-05-12T11:00:00",
                        issueCategory: "Hardware",
                        issueDescription: "Several keys (Q, W, E, R) are unresponsive after accidental liquid spill.",
                        severity: "Medium", status: "Open",
                        technicianId: null, technicianName: null,
                        expectedResolution: "2026-05-14T11:00:00", actualResolution: null, resolutionNotes: null,
                        slaStatus: "OnTrack"
                    },
                    {
                        requestId: "RR004", requestNumber: "RR-2026-00004",
                        assetId: "AST004", assetTag: "LAP-2026-0453", assetType: "Laptop", assetMake: "Lenovo", assetModel: "ThinkPad X1 Carbon",
                        employeeId: "EMP004", employeeName: "Sunita Rao", department: "Finance",
                        raisedOn: "2026-05-08T08:45:00",
                        issueCategory: "Physical Damage",
                        issueDescription: "Laptop dropped from desk. Screen is cracked. Device cannot power on. Urgent repair needed.",
                        severity: "High", status: "InProgress",
                        technicianId: "TECH001", technicianName: "Amit Kumar",
                        expectedResolution: "2026-05-09T12:45:00", actualResolution: null, resolutionNotes: null,
                        slaStatus: "Breached"
                    },
                    {
                        requestId: "RR005", requestNumber: "RR-2026-00005",
                        assetId: "AST002", assetTag: "LAP-2026-0452", assetType: "Laptop", assetMake: "HP", assetModel: "EliteBook 840 G9",
                        employeeId: "EMP002", employeeName: "Priya Mehta", department: "Finance",
                        raisedOn: "2026-05-13T14:00:00",
                        issueCategory: "Software",
                        issueDescription: "Cannot install required software updates. Admin privileges needed. System update keeps failing with error code 0x8024A105.",
                        severity: "Low", status: "Open",
                        technicianId: null, technicianName: null,
                        expectedResolution: "2026-05-15T14:00:00", actualResolution: null, resolutionNotes: null,
                        slaStatus: "OnTrack"
                    },
                    {
                        requestId: "RR006", requestNumber: "RR-2026-00006",
                        assetId: "AST003", assetTag: "MON-2026-0101", assetType: "Monitor", assetMake: "Samsung", assetModel: "27\" FHD",
                        employeeId: "EMP003", employeeName: "Vikram Nair", department: "Engineering",
                        raisedOn: "2026-05-09T16:30:00",
                        issueCategory: "Hardware",
                        issueDescription: "Monitor showing dead pixels (~15 in cluster) and color distortion on right side of display.",
                        severity: "Medium", status: "Resolved",
                        technicianId: "TECH002", technicianName: "Deepa Krishnan",
                        expectedResolution: "2026-05-10T16:30:00", actualResolution: "2026-05-10T15:00:00",
                        resolutionNotes: "Replaced the monitor with a spare unit. Faulty monitor sent for vendor repair under warranty.",
                        slaStatus: "OnTrack"
                    },
                    {
                        requestId: "RR007", requestNumber: "RR-2026-00007",
                        assetId: "AST006", assetTag: "CHR-2026-0301", assetType: "Chair", assetMake: "Herman Miller", assetModel: "Aeron Size B",
                        employeeId: "EMP001", employeeName: "Arjun Sharma", department: "Engineering",
                        raisedOn: "2026-05-07T09:00:00",
                        issueCategory: "Physical Damage",
                        issueDescription: "One of the chair caster wheels is broken, causing instability and difficulty in movement.",
                        severity: "Low", status: "Closed",
                        technicianId: "TECH003", technicianName: "Ravi Shankar",
                        expectedResolution: "2026-05-09T09:00:00", actualResolution: "2026-05-08T14:00:00",
                        resolutionNotes: "Replaced the damaged caster wheel. Chair is fully functional now.",
                        slaStatus: "OnTrack"
                    }
                ],

                mitigationRequests: [
                    {
                        mitigationId: "MR001", mitigationNumber: "MR-2026-00001",
                        linkedRepairId: "RR004", linkedRepairNumber: "RR-2026-00004",
                        assetTag: "LAP-2026-0453", assetType: "Laptop",
                        employeeId: "EMP004", employeeName: "Sunita Rao", department: "Finance",
                        raisedOn: "2026-05-08T10:00:00",
                        urgencyReason: "I am working on the Q1 financial report due for board presentation on 2026-05-15. This is a critical board deliverable and I cannot proceed without my laptop.",
                        businessImpact: "Critical",
                        approvalStatus: "Pending",
                        approverId: null, approverName: null,
                        sparePoolId: null, spareAssetTag: null,
                        issuedOn: null, returnDueDate: null, returnedOn: null,
                        status: "Requested",
                        rejectionReason: null
                    },
                    {
                        mitigationId: "MR002", mitigationNumber: "MR-2026-00002",
                        linkedRepairId: "RR002", linkedRepairNumber: "RR-2026-00002",
                        assetTag: "PHN-2026-0201", assetType: "IP Phone",
                        employeeId: "EMP005", employeeName: "Rahul Gupta", department: "HR",
                        raisedOn: "2026-05-11T11:00:00",
                        urgencyReason: "Multiple critical client calls and HR interviews scheduled this week. The IP phone is my primary communication device and I cannot conduct interviews from my personal mobile.",
                        businessImpact: "High",
                        approvalStatus: "Approved",
                        approverId: "EMP003", approverName: "Vikram Nair",
                        sparePoolId: "SP004", spareAssetTag: "SP-PHN-001",
                        issuedOn: "2026-05-12T09:00:00", returnDueDate: "2026-05-19", returnedOn: null,
                        status: "Issued",
                        rejectionReason: null
                    },
                    {
                        mitigationId: "MR003", mitigationNumber: "MR-2026-00003",
                        linkedRepairId: "RR001", linkedRepairNumber: "RR-2026-00001",
                        assetTag: "LAP-2026-0451", assetType: "Laptop",
                        employeeId: "EMP001", employeeName: "Arjun Sharma", department: "Engineering",
                        raisedOn: "2026-05-10T10:00:00",
                        urgencyReason: "Sprint deadline is today. Need to complete code review and deployment for release. Team members' systems are occupied.",
                        businessImpact: "High",
                        approvalStatus: "Rejected",
                        approverId: "EMP003", approverName: "Vikram Nair",
                        sparePoolId: null, spareAssetTag: null,
                        issuedOn: null, returnDueDate: null, returnedOn: null,
                        status: "Closed",
                        rejectionReason: "Repair is expected to complete by EOD today. Please use the shared workstation in the lab until the repair is done."
                    }
                ],

                slaConfig: [
                    { configId: "SLA001", assetTypeId: "LAPTOP",   severity: "High",   responseTimeHours: 2,  resolutionTimeHours: 4,  mitigationSLAHours: 4  },
                    { configId: "SLA002", assetTypeId: "LAPTOP",   severity: "Medium", responseTimeHours: 4,  resolutionTimeHours: 8,  mitigationSLAHours: 8  },
                    { configId: "SLA003", assetTypeId: "LAPTOP",   severity: "Low",    responseTimeHours: 8,  resolutionTimeHours: 24, mitigationSLAHours: 24 },
                    { configId: "SLA004", assetTypeId: "MONITOR",  severity: "Medium", responseTimeHours: 8,  resolutionTimeHours: 16, mitigationSLAHours: 16 },
                    { configId: "SLA005", assetTypeId: "PHONE",    severity: "High",   responseTimeHours: 2,  resolutionTimeHours: 4,  mitigationSLAHours: 4  },
                    { configId: "SLA006", assetTypeId: "KEYBOARD", severity: "Medium", responseTimeHours: 8,  resolutionTimeHours: 24, mitigationSLAHours: 24 },
                    { configId: "SLA007", assetTypeId: "CHAIR",    severity: "Low",    responseTimeHours: 24, resolutionTimeHours: 48, mitigationSLAHours: 48 }
                ],

                kpis: {
                    openTickets:       5,
                    pendingApprovals:  1,
                    activeMitigations: 1,
                    availableSpares:   3,
                    slaCompliance:     71,
                    mttr:              6.5,
                    breachedCount:     2,
                    atRiskCount:       1,
                    totalAssets:       10
                }
            };
        }
    };
});
