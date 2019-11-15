export class Constants {
  public static readonly tableDefaults = {
    DEFAULT_CURRENT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_SORT_BY: '',
    DEFAULT_KEYWORDS: ''
  };

  public static readonly EAC_DECISIONS = [
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

  public static readonly PROJECT_NATURE = [
    'New Construction',
    'Modification of Existing',
    'Dismantling or Abandonment'
  ];

  public static readonly PROJECT_STATUS = [
    'Initiated',
    'Submitted',
    'In Progress', // default, set in BuildForm() and BuildFormFromData()
    'Certified',
    'Not Certified',
    'Decommissioned'
  ];

  public static readonly PROJECT_TYPES = [
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

  public static readonly PROJECT_SUBTYPES = {
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
    'Food Processing': [
      'Fish Products Industry',
      'Meat and Meat Products Industry',
      'Poultry Products Industry'
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
