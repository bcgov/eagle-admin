export class Constants {
  public static readonly tableDefaults = {
    DEFAULT_CURRENT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_SORT_BY: '',
    DEFAULT_KEYWORDS: ''
  };

  public static readonly EAC_DECISIONS = (legislationYear: Number): Array<string> => {
    switch (legislationYear) {
      case 2002:
        return [
          'In Progress', // default, set in BuildForm() and BuildFormFromData()
          'Certificate Issued',
          'Certificate Refused',
          'Further Assessment Required',
          'Certificate Not Required',
          'Certificate Expired',
          'Withdrawn',
          'Terminated',
          'Pre-EA Act Approval',
          'Not Designated Reviewable'
      ];
      case 2018:
        return [
          'Project Designated Non-Reviewable',
          'Exemption Order',
          'Readiness Termination',
          'In Progress',
          'Assessment Terminated',
          'Application Withdrawn',
          'Certificate Issued',
          'Certificate Refused',
          'Certificate Expired',
          'Certificate Cancelled',
          'Exemption Order Rescinded',
          'Certificate Reinstated',
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
          'Dispute Resolution',
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
        'Hazardous Waste Management',
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
