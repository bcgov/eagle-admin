export interface BuildNature {
  build: string;
  nature: string;
}

export class Constants {
  public static readonly tableDefaults = {
    DEFAULT_CURRENT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_SORT_BY: '',
    DEFAULT_KEYWORDS: ''
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

  public static readonly CEAA_INVOLVEMENTS_COLLECTION: object[] = [
    {
      code: 'None',
      name: 'None',
      legislation: 2002
    },
    {
      code: 'Panel',
      name: 'Panel',
      legislation: 2002
    },
    {
      code: 'Panel (CEAA 2012)',
      name: 'Panel (CEAA 2012)',
      legislation: 2002
    },
    {
      code: 'Coordinated',
      name: 'Coordinated',
      legislation: 2002
    },
    {
      code: 'Screening',
      name: 'Screening',
      legislation: 2002
    },
    {
      code: 'Screening - Confirmed',
      name: 'Screening - Confirmed',
      legislation: 2002
    },
    {
      code: 'Substituted',
      name: 'Substituted',
      legislation: 2002
    },
    {
      code: 'Substituted (Provincial Lead)',
      name: 'Substituted (Provincial Lead)',
      legislation: 2002
    },
    {
      code: 'Comprehensive Study',
      name: 'Comprehensive Study',
      legislation: 2002
    },
    {
      code: 'Comprehensive Study - Unconfirmed',
      name: 'Comprehensive Study - Unconfirmed',
      legislation: 2002
    },
    {
      code: 'Comprehensive Study - Confirmed',
      name: 'Comprehensive Study - Confirmed',
      legislation: 2002
    },
    {
      code: 'Comprehensive Study (Pre CEAA 2012)',
      name: 'Comprehensive Study (Pre CEAA 2012)',
      legislation: 2002
    },
    {
      code: 'Comp Study',
      name: 'Comp Study',
      legislation: 2002
    },
    {
      code: 'Comp Study - Unconfirmed',
      name: 'Comp Study - Unconfirmed',
      legislation: 2002
    },
    {
      code: 'To be determined',
      name: 'To be determined',
      legislation: 2002
    },
    {
      code: 'Equivalent - NEB',
      name: 'Equivalent - NEB',
      legislation: 2002
    },
    {
      code: 'Substitution',
      name: 'Substitution',
      legislation: 2018
    },
    {
      code: 'Coordination',
      name: 'Coordination',
      legislation: 2018
    },
    {
      code: 'Joint Review Panel',
      name: 'Joint Review Panel',
      legislation: 2018
    },
    {
      code: 'Substituted to CER',
      name: 'Coordinated',
      legislation: 2018
    },
  ];

  public static readonly EAC_DECISIONS_COLLECTION: object[] = [
    {
      code: 'inProgress',
      name: 'In Progress',
      legislation: 2002
    },
    {
      code: 'certificateIssued',
      name: 'Certificate Issued',
      legislation: 2002
    },
    {
      code: 'certificateRefused',
      name: 'Certificate Refused',
      legislation: 2002
    },
    {
      code: 'furtherAssessmentRequired',
      name: 'Further Assessment Required',
      legislation: 2002
    },
    {
      code: 'certificateNotRequired',
      name: 'Certificate Not Required',
      legislation: 2002
    },
    {
      code: 'certificateExpired',
      name: 'Certificate Expired',
      legislation: 2002
    },
    {
      code: 'withdrawn',
      name: 'Withdrawn',
      legislation: 2002
    },
    {
      code: 'terminated',
      name: 'Terminated',
      legislation: 2002
    },
    {
      code: 'preEA',
      name: 'Pre-EA Act Approval',
      legislation: 2002
    },
    {
      code: 'notReviewable',
      name: 'Not Designated Reviewable',
      legislation: 2002
     },
     {
      code: 'inProgress',
      name: 'In Progress',
      legislation: 2018
     },
     {
      code: 'exemptionOrder',
      name: 'Exemption Order',
      legislation: 2018
     },
     {
      code: 'assessmentTerminated',
      name: 'Assessment Terminated',
      legislation: 2018
     },
     {
      code: 'applicationWithdrawn',
      name: 'Application Withdrawn',
      legislation: 2018
     },
     {
      code: 'certificateIssued',
      name: 'Certificate Issued',
      legislation: 2018
     },
     {
      code: 'certificateRefused',
      name: 'Certificate Refused',
      legislation: 2018
     },
     {
      code: 'certificateCancelled',
      name: 'Certificate Cancelled',
      legislation: 2018
     },
     {
      code: 'certificateExpired',
      name: 'Certificate Expired',
      legislation: 2018
     },
     {
      code: 'exemptionOrderRescinded',
      name: 'Exemption Order Rescinded',
      legislation: 2018
     },
     {
      code: 'certificateReinstated',
      name: 'Certificate Reinstated',
      legislation: 2018
     },
     {
      code: 'readinessTermination',
      name: 'Readiness Termination',
      legislation: 2018
     },
     {
      code: 'projectDesignatedNonReviewable',
      name: 'Project Designated Non-Reviewable',
      legislation: 2018
     },
     {
      code: 'certificateEndOfLife',
      name: 'Certificate End of Life',
      legislation: 2018
     }
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
          'Initiated',
          'Submitted',
          'In Progress', // default, set in BuildForm() and BuildFormFromData()
          'Certified',
          'Not Certified',
          'Decommissioned'
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
