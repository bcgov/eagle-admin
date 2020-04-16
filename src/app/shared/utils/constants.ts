import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export interface BuildNature {
  build: string;
  nature: string;
}

export class Constants {
  public static readonly minPickerDate: NgbDateStruct = { year: 1900, month: 1, day: 1 };
  public static readonly maxPickerDate: NgbDateStruct = { year: (new Date().getFullYear() + 20), month: 1, day: 1 };

  public static readonly NOTIFICATION_TRIGGERS = [
    { name: 'Organic/Inorganic Chemicals', header: 'Design Thresholds'  },
    { name: 'Dangerous Organic/Inorganic Chemicals', header: 'Design Thresholds' },
    { name: 'Non-Metallic Mineral Products', header: 'Design Thresholds' },
    { name: 'Non-Integrated Paper and Paperboard', header: 'Design Thresholds' },
    { name: 'Wood Preservation', header: 'Design Thresholds' },
    { name: 'Sawmill', header: 'Design Thresholds' },
    { name: 'Plywood or Plywood & Veneer', header: 'Design Thresholds' },
    { name: 'Veneer but not Plywood', header: 'Design Thresholds' },
    { name: 'Particleboard/Fibreboard/Waferboard', header: 'Design Thresholds' },
    { name: 'Biopharmaceutical Products', header: 'Design Thresholds' },
    { name: 'Non-biopharmaceutical Products', header: 'Design Thresholds' },
    { name: 'Fibres/Filaments/Textiles', header: 'Design Thresholds' },
    { name: 'Leather & Hide Tanning/Finishing', header: 'Design Thresholds' },
    { name: 'Coal Mine', header: 'Design Thresholds' },
    { name: 'Mineral Mine', header: 'Design Thresholds' },
    { name: 'Sand & Gravel Pit (Yearly Production)', header: 'Design Thresholds' },
    { name: 'Sand & Gravel Pit (Total Production)', header: 'Design Thresholds' },
    { name: 'Placer Mineral Mine', header: 'Design Thresholds' },
    { name: 'Stone/Mineral Quarry', header: 'Design Thresholds' },
    { name: 'Land Based Wind Turbines', header: 'Design Thresholds' },
    { name: 'Water Based Wind Turbines', header: 'Design Thresholds' },
    { name: 'In-Stream Tidal Power', header: 'Design Thresholds' },
    { name: 'Power Plant', header: 'Design Thresholds' },
    { name: 'Transmission Line (linear project)', header: 'Design Thresholds' },
    { name: 'LNG Energy Storage', header: 'Design Thresholds' },
    { name: 'Energy Storage', header: 'Design Thresholds' },
    { name: 'Oil Refinery', header: 'Design Thresholds' },
    { name: 'Natural Gas Processing Plant', header: 'Design Thresholds' },
    { name: '< 114.3mm Transmission Pipeline', header: 'Design Thresholds' },
    { name: '114.3mm ~ 323.9mm Transmission Pipeline', header: 'Design Thresholds' },
    { name: '> 323.9mm Transmission Pipeline', header: 'Design Thresholds' },
    { name: 'Dam Height', header: 'Design Thresholds' },
    { name: 'Dam Capacity', header: 'Design Thresholds' },
    { name: 'Dike', header: 'Design Thresholds' },
    { name: 'Water Diversion', header: 'Design Thresholds' },
    { name: 'Groundwater Extraction', header: 'Design Thresholds' },
    { name: 'Shoreline Modification (Linear)', header: 'Design Thresholds' },
    { name: 'Shoreline Modification (Flooded Area)', header: 'Design Thresholds' },
    { name: 'Solid Waste Landfill', header: 'Design Thresholds' },
    { name: 'Solid Waste Incinerator', header: 'Design Thresholds' },
    { name: 'Liquid Waste Management Facility', header: 'Design Thresholds' },
    { name: 'Public Highway', header: 'Design Thresholds' },
    { name: 'Railway', header: 'Design Thresholds' },
    { name: 'Ferry (Capacity)', header: 'Design Thresholds' },
    { name: 'Ferry (Linear)', header: 'Design Thresholds' },
    { name: 'Ferry (Flooded Area)', header: 'Design Thresholds' },
    { name: 'Marine Port (Linear)', header: 'Design Thresholds' },
    { name: 'Marine Port (Flooded Area)', header: 'Design Thresholds' },
    { name: 'Airport', header: 'Design Thresholds' },
    { name: 'Golf Resort', header: 'Design Thresholds' },
    { name: 'Marina Resort', header: 'Design Thresholds' },
    { name: 'Ski Resort', header: 'Design Thresholds' },
    { name: 'Other Resort', header: 'Design Thresholds' },
    { name: 'IAAC Designation', header: 'Effects Thresholds' },
    { name: 'Workforce', header: 'Effects Thresholds' },
    { name: 'Greenhouse Gases (new project)', header: 'Effects Thresholds' },
    { name: 'Greenhouse Gases (modification)', header: 'Effects Thresholds' },
    { name: 'Transmission Line (non-linear projects)', header: 'Effects Thresholds' },
    { name: 'Land Clearance (Linear)', header: 'Effects Thresholds' },
    { name: 'Land Clearance (Area)', header: 'Effects Thresholds' }
  ];

  public static readonly NOTIFICATION_DECISIONS = [
    'In Progress',
    'Referred for s.11 consideration',
    'Not referred for s.11 consideration'
  ];

  public static readonly tableDefaults = {
    DEFAULT_CURRENT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_SORT_BY: '',
    DEFAULT_KEYWORDS: ''
  };

  // This order matters for the activity component
  public static readonly activityTypes = [
    'Public Comment Period',
    'Project Notification Public Comment Period',
    'News'
  ];

  public static readonly documentTypes = {
    CATEGORIZED: 'categorized',
    UNCATEGORIZED: 'uncategorized',
  };

  public static readonly buildToNature: BuildNature[] = [
    { build: 'new',
      nature: 'New Construction'
    },
    { build: 'modification',
      nature: 'Modification of Existing'
    },
    { build: 'dismantling',
      nature: 'Dismantling or Abandonment'
    },
  ];

  public static readonly PCP_COLLECTION: object[] = [
    { code: 'pending', name: 'Pending' },
    { code: 'open', name: 'Open' },
    { code: 'closed', name: 'Closed' }
  ];

  public static readonly PROJECT_TYPE_COLLECTION: object[] = [
    { code: 'energyElectricity', name: 'Energy-Electricity' },
    { code: 'energyPetroleum', name: 'Energy-Petroleum & Natural Gas' },
    { code: 'foodProcessing', name: 'Food Processing' },
    { code: 'industrial', name: 'Industrial' },
    { code: 'mines', name: 'Mines' },
    { code: 'other', name: 'Other' },
    { code: 'tourist', name: 'Tourist Destination Resorts' },
    { code: 'transportation', name: 'Transportation' },
    { code: 'wasteDisposal', name: 'Waste Disposal' },
    { code: 'waterManagement', name: 'Water Management' }
  ];

  public static readonly EA_READINESS_TYPES = (legislationYear: Number): Array<string> => {
    switch (legislationYear) {
      case 2002:
        return [
          'No Determination',
          'Does not require EAC',
          'Proceed with Assessment',
          'Requires EAC'
      ];
      case 2018:
        return [
          'Exempt',
          'Terminate',
          'Proceed with Assessment',
      ];
    }
  }
  public static readonly CEAA_INVOLVEMENT = (legislationYear: Number): Array<string> => {
    switch (legislationYear) {
      case 2002:
        return [
          'None',
          'Panel',
          'Panel (CEAA 2012)',
          'Coordinated',
          'Screening',
          'Screening - Confirmed',
          'Substituted',
          'Substituted (Provincial Lead)',
          'Comprehensive Study',
          'Comprehensive Study - Unconfirmed',
          'Comprehensive Study - Confirmed',
          'Comprehensive Study (Pre CEAA 2012)',
          'Comp Study',
          'Comp Study - Unconfirmed',
          'To be determined',
          'Equivalent - NEB',
      ];
      case 2018:
        return [
          'Substitution',
          'Coordination',
          'Joint Review Panel',
          'Substituted to CER'
      ];
    }
  }
  public static readonly EAC_DECISIONS = (legislationYear: Number): Array<string> => {
    switch (legislationYear) {
      case 2002:
        return [
          'In Progress',
          'Certificate Not Required',
          'Terminated',
          'Withdrawn',
          'Pre-EA Act Approval',
          'Certificate Issued',
          'Certificate Refused',
          'Certificate Expired',
          'Not Designated Reviewable',
          'Further Assessment Required'
      ];
      case 2018:
        return [
          'In Progress',
          'Exemption Order',
          'Assessment Terminated',
          'Application Withdrawn',
          'Certificate Issued',
          'Certificate Refused',
          'Certificate Cancelled',
          'Certificate Expired',
          'Exemption Order Rescinded',
          'Certificate Reinstated',
          'Readiness Termination',
          'Project Designated Non-Reviewable',
          'Certificate End of Life'
      ];
    }
  }

  public static readonly PROJECT_NATURE = (legislationYear: Number): Array<string> => {
    switch (legislationYear) {
      case 2002:
        return [
        'New Construction',
        'Modification of Existing',
        'Dismantling or Abandonment'
      ];
      case 2018:
        return [
          'New Construction',
          'Modification of Existing',
          'Dismantling or Abandonment'
      ];
    }
  }

  public static readonly PROJECT_STATUS = (legislationYear: Number): Array<string> => {
    switch (legislationYear) {
      case 2002:
        return [
          'Scope',
          'Evaluation',
          'Application Review',
          'Referral',
          'Further Assessment',
          'Post Decision - Pre-Construction',
          'Post Decision - Construction',
          'Post Decision - Operation',
          'Post Decision - Care & Maintenance',
          'Post Decision - Decommission',
          'Post Decision - Amendment',
          'Post Decision - Substantial Start',
          'Post Decision - EAC Extension',
          'Post Decision - Suspension',
          'Complete',
          'Other'
        ];
        case 2018:
        return [
          'Minister\'s Designation',
          'Early Engagement',
          'EA Readiness Decision',
          'Process Planning',
          'Application Development & Review',
          'Effects Assessment',
          'Referral',
          'Post Decision - Pre-Construction',
          'Post Decision - Construction',
          'Post Decision - Operation',
          'Post Decision - Care & Maintenance',
          'Post Decision - Decommission',
          'Post Decision - Amendment',
          'Post Decision - Substantial Start',
          'Post Decision - EAC Extension',
          'Post Decision - Suspension',
          'Complete',
          'Other'
        ];
      }
    }

  public static readonly PROJECT_TYPES = (legislationYear: Number): Array<string> => {
    switch (legislationYear) {
      case 2002:
        return [
          'Energy-Electricity',
          'Energy-Petroleum & Natural Gas',
          'Food Processing',
          'Industrial',
          'Mines',
          'Other',
          'Tourist Destination Resorts',
          'Transportation',
          'Waste Disposal',
          'Water Management'
        ];
      // 2018 is also used for notification projects
      case 2018:
      return [
        'Energy-Electricity',
        'Energy-Petroleum & Natural Gas',
        'Industrial',
        'Mines',
        'Other',
        'Tourist Destination Resorts',
        'Transportation',
        'Waste Disposal',
        'Water Management'
      ];
    }
  }

  public static readonly PROJECT_SUBTYPES = (legislationYear: Number): Object => {
    switch (legislationYear) {
      case 2002:
      return {
        'Mines': [
          'Coal Mines',
          'Construction Stone and Industrial Mineral Quarries',
          'Mineral Mines',
          'Off-shore Mines',
          'Placer Mineral Mines',
          'Sand and Gravel Pits'
        ],
        'Energy-Electricity': [
          'Electric Transmission Lines',
          'Power Plants'
        ],
        'Energy-Petroleum & Natural Gas': [
          'Energy Storage Facilities',
          'Natural Gas Processing Plants',
          'Off-shore Oil or Gas Facilities',
          'Transmission Pipelines'
        ],
        'Food Processing': [
          'Fish Products Industry',
          'Meat and Meat Products Industry',
          'Poultry Products Industry'
        ],
        'Transportation': [
          'Airports',
          'Ferry Terminals',
          'Marine Port Facilities',
          'Public Highways',
          'Railways'
        ],
        'Water Management': [
          'Dams',
          'Dykes',
          'Groundwater Extraction',
          'Shoreline Modification',
          'Water Diversion'
        ],
        'Industrial': [
          'Forest Products Industries',
          'Non-metallic Mineral Products Industries',
          'Organic and Inorganic Chemical Industry',
          'Other Industries',
          'Primary Metals Industry'
        ],
        'Waste Disposal': [
          'Hazardous Waste Facilities',
          'Local Government Liquid Waste Management Facilities',
          'Local Government Solid Waste Management Facilities'
        ],
        'Tourist Destination Resorts': [
          'Golf Resorts',
          'Marina Resorts',
          'Resort Developments',
          'Ski Resorts'
        ],
        'Other': [
          'Other'
        ]
      };
      case 2018:
        return {
        'Mines': [
          'Coal Mines',
          'Construction Stone and Industrial Mineral Quarries',
          'Mineral Mines',
          'Off-shore Mines',
          'Placer Mineral Mines',
          'Sand and Gravel Pits'
        ],
        'Energy-Electricity': [
          'Electric Transmission Lines',
          'Power Plants'
        ],
        'Energy-Petroleum & Natural Gas': [
          'Energy Storage Facilities',
          'Natural Gas Processing Plants',
          'Off-shore Oil or Gas Facilities',
          'Oil Refineries',
          'Transmission Pipelines'
        ],
        'Transportation': [
          'Airports',
          'Ferry Terminals',
          'Marine Port Projects',
          'Public Highways',
          'Railways'
        ],
        'Water Management': [
          'Dams',
          'Dikes',
          'Groundwater Extraction',
          'Shoreline Modification',
          'Water Diversion'
        ],
        'Industrial': [
          'Forest Products Industries',
          'Non-metallic Mineral Products Industries',
          'Organic and Inorganic Chemical Industry',
          'Other Industries',
          'Primary Metals Industry'
        ],
        'Hazardous Waste Management': [
          'Hazardous Waste Facilities',
          'Local Government Liquid Waste Management Facilities',
          'Solid Waste Management'
        ],
        'Waste Disposal': [
          'Hazardous Waste Management',
          'Solid Waste Management',
          'Liquid Waste Management'
        ],
        'Tourist Destination Resorts': [
          'Golf Resorts',
          'Marina Resorts',
          'Resort Developments',
          'Ski Resorts'
        ],
        'Other': [
          'Other'
        ]
      };
    }
  }
}
