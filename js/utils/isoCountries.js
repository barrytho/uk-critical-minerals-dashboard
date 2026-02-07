/**
 * ISO 3166-1 alpha-3 to numeric code mapping.
 * Used to match BGS country codes to world-atlas TopoJSON IDs.
 */

export const ISO_ALPHA3_TO_NUMERIC = {
  AFG: '004', ALB: '008', DZA: '012', ASM: '016', AND: '020',
  AGO: '024', ATG: '028', ARG: '032', ARM: '051', AUS: '036',
  AUT: '040', AZE: '031', BHS: '044', BHR: '048', BGD: '050',
  BRB: '052', BLR: '112', BEL: '056', BLZ: '084', BEN: '204',
  BMU: '060', BTN: '064', BOL: '068', BIH: '070', BWA: '072',
  BRA: '076', BRN: '096', BGR: '100', BFA: '854', BDI: '108',
  KHM: '116', CMR: '120', CAN: '124', CPV: '132', CAF: '140',
  TCD: '148', CHL: '152', CHN: '156', COL: '170', COM: '174',
  COG: '178', COD: '180', CRI: '188', CIV: '384', HRV: '191',
  CUB: '192', CYP: '196', CZE: '203', DNK: '208', DJI: '262',
  DMA: '212', DOM: '214', ECU: '218', EGY: '818', SLV: '222',
  GNQ: '226', ERI: '232', EST: '233', SWZ: '748', ETH: '231',
  FJI: '242', FIN: '246', FRA: '250', GAB: '266', GMB: '270',
  GEO: '268', DEU: '276', GHA: '288', GRC: '300', GRL: '304',
  GRD: '308', GTM: '320', GIN: '324', GNB: '624', GUY: '328',
  HTI: '332', HND: '340', HUN: '348', ISL: '352', IND: '356',
  IDN: '360', IRN: '364', IRQ: '368', IRL: '372', ISR: '376',
  ITA: '380', JAM: '388', JPN: '392', JOR: '400', KAZ: '398',
  KEN: '404', KIR: '296', PRK: '408', KOR: '410', KWT: '414',
  KGZ: '417', LAO: '418', LVA: '428', LBN: '422', LSO: '426',
  LBR: '430', LBY: '434', LIE: '438', LTU: '440', LUX: '442',
  MDG: '450', MWI: '454', MYS: '458', MDV: '462', MLI: '466',
  MLT: '470', MHL: '584', MRT: '478', MUS: '480', MEX: '484',
  FSM: '583', MDA: '498', MCO: '492', MNG: '496', MNE: '499',
  MAR: '504', MOZ: '508', MMR: '104', NAM: '516', NRU: '520',
  NPL: '524', NLD: '528', NCL: '540', NZL: '554', NIC: '558',
  NER: '562', NGA: '566', MKD: '807', NOR: '578', OMN: '512',
  PAK: '586', PLW: '585', PAN: '591', PNG: '598', PRY: '600',
  PER: '604', PHL: '608', POL: '616', PRT: '620', QAT: '634',
  ROU: '642', RUS: '643', RWA: '646', KNA: '659', LCA: '662',
  VCT: '670', WSM: '882', SMR: '674', STP: '678', SAU: '682',
  SEN: '686', SRB: '688', SYC: '690', SLE: '694', SGP: '702',
  SVK: '703', SVN: '705', SLB: '090', SOM: '706', ZAF: '710',
  SSD: '728', ESP: '724', LKA: '144', SDN: '729', SUR: '740',
  SWE: '752', CHE: '756', SYR: '760', TWN: '158', TJK: '762',
  TZA: '834', THA: '764', TLS: '626', TGO: '768', TON: '776',
  TTO: '780', TUN: '788', TUR: '792', TKM: '795', TUV: '798',
  UGA: '800', UKR: '804', ARE: '784', GBR: '826', USA: '840',
  URY: '858', UZB: '860', VUT: '548', VEN: '862', VNM: '704',
  YEM: '887', ZMB: '894', ZWE: '716',
  // Additional/alternate codes
  XKX: '983', PSE: '275', ESH: '732', FLK: '238', GUF: '254',
  GLP: '312', MTQ: '474', REU: '638', SPM: '666', SHN: '654',
  WLF: '876', MYT: '175', PYF: '258', ATF: '260',
  CUW: '531', SXM: '534', BES: '535', ABW: '533',
  AIA: '660', MSR: '500', TCA: '796', VGB: '092', CYM: '136',
  COK: '184', NIU: '570', TKL: '772', PCN: '612',
  IOT: '086', CXR: '162', CCK: '166', NFK: '574', HMD: '334',
  SGS: '239', BVT: '074', UMI: '581',
  HKG: '344', MAC: '446', PRI: '630', GUM: '316', VIR: '850',
  MNP: '580'
};

/**
 * Convert ISO alpha-3 to numeric code string.
 */
export function alpha3ToNumeric(alpha3) {
  return ISO_ALPHA3_TO_NUMERIC[alpha3] || null;
}

/**
 * Build reverse map: numeric -> alpha3.
 */
const NUMERIC_TO_ALPHA3 = {};
for (const [a3, num] of Object.entries(ISO_ALPHA3_TO_NUMERIC)) {
  NUMERIC_TO_ALPHA3[num] = a3;
}

export function numericToAlpha3(numericCode) {
  const padded = String(numericCode).padStart(3, '0');
  return NUMERIC_TO_ALPHA3[padded] || null;
}

/**
 * Country display names (alpha-3 -> name).
 */
export const COUNTRY_NAMES = {
  AFG: 'Afghanistan', ALB: 'Albania', DZA: 'Algeria', AGO: 'Angola',
  ARG: 'Argentina', ARM: 'Armenia', AUS: 'Australia', AUT: 'Austria',
  AZE: 'Azerbaijan', BHS: 'Bahamas', BHR: 'Bahrain', BGD: 'Bangladesh',
  BLR: 'Belarus', BEL: 'Belgium', BEN: 'Benin', BTN: 'Bhutan',
  BOL: 'Bolivia', BIH: 'Bosnia and Herzegovina', BWA: 'Botswana',
  BRA: 'Brazil', BRN: 'Brunei', BGR: 'Bulgaria', BFA: 'Burkina Faso',
  BDI: 'Burundi', KHM: 'Cambodia', CMR: 'Cameroon', CAN: 'Canada',
  CAF: 'Central African Republic', TCD: 'Chad', CHL: 'Chile', CHN: 'China',
  COL: 'Colombia', COG: 'Congo', COD: 'DR Congo', CRI: 'Costa Rica',
  CIV: "Cote d'Ivoire", HRV: 'Croatia', CUB: 'Cuba', CYP: 'Cyprus',
  CZE: 'Czech Republic', DNK: 'Denmark', DOM: 'Dominican Republic',
  ECU: 'Ecuador', EGY: 'Egypt', SLV: 'El Salvador', GNQ: 'Equatorial Guinea',
  ERI: 'Eritrea', EST: 'Estonia', SWZ: 'Eswatini', ETH: 'Ethiopia',
  FJI: 'Fiji', FIN: 'Finland', FRA: 'France', GAB: 'Gabon', GMB: 'Gambia',
  GEO: 'Georgia', DEU: 'Germany', GHA: 'Ghana', GRC: 'Greece',
  GRL: 'Greenland', GTM: 'Guatemala', GIN: 'Guinea', GNB: 'Guinea-Bissau',
  GUY: 'Guyana', HTI: 'Haiti', HND: 'Honduras', HUN: 'Hungary',
  ISL: 'Iceland', IND: 'India', IDN: 'Indonesia', IRN: 'Iran',
  IRQ: 'Iraq', IRL: 'Ireland', ISR: 'Israel', ITA: 'Italy', JAM: 'Jamaica',
  JPN: 'Japan', JOR: 'Jordan', KAZ: 'Kazakhstan', KEN: 'Kenya',
  PRK: 'North Korea', KOR: 'South Korea', KWT: 'Kuwait', KGZ: 'Kyrgyzstan',
  LAO: 'Laos', LVA: 'Latvia', LBN: 'Lebanon', LSO: 'Lesotho',
  LBR: 'Liberia', LBY: 'Libya', LTU: 'Lithuania', LUX: 'Luxembourg',
  MDG: 'Madagascar', MWI: 'Malawi', MYS: 'Malaysia', MLI: 'Mali',
  MRT: 'Mauritania', MUS: 'Mauritius', MEX: 'Mexico', MDA: 'Moldova',
  MNG: 'Mongolia', MNE: 'Montenegro', MAR: 'Morocco', MOZ: 'Mozambique',
  MMR: 'Myanmar', NAM: 'Namibia', NPL: 'Nepal', NLD: 'Netherlands',
  NCL: 'New Caledonia', NZL: 'New Zealand', NIC: 'Nicaragua', NER: 'Niger',
  NGA: 'Nigeria', MKD: 'North Macedonia', NOR: 'Norway', OMN: 'Oman',
  PAK: 'Pakistan', PAN: 'Panama', PNG: 'Papua New Guinea', PRY: 'Paraguay',
  PER: 'Peru', PHL: 'Philippines', POL: 'Poland', PRT: 'Portugal',
  QAT: 'Qatar', ROU: 'Romania', RUS: 'Russia', RWA: 'Rwanda',
  SAU: 'Saudi Arabia', SEN: 'Senegal', SRB: 'Serbia', SLE: 'Sierra Leone',
  SGP: 'Singapore', SVK: 'Slovakia', SVN: 'Slovenia', ZAF: 'South Africa',
  SSD: 'South Sudan', ESP: 'Spain', LKA: 'Sri Lanka', SDN: 'Sudan',
  SUR: 'Suriname', SWE: 'Sweden', CHE: 'Switzerland', SYR: 'Syria',
  TWN: 'Taiwan', TJK: 'Tajikistan', TZA: 'Tanzania', THA: 'Thailand',
  TGO: 'Togo', TTO: 'Trinidad and Tobago', TUN: 'Tunisia', TUR: 'Turkey',
  TKM: 'Turkmenistan', UGA: 'Uganda', UKR: 'Ukraine',
  ARE: 'United Arab Emirates', GBR: 'United Kingdom', USA: 'United States',
  URY: 'Uruguay', UZB: 'Uzbekistan', VEN: 'Venezuela', VNM: 'Vietnam',
  YEM: 'Yemen', ZMB: 'Zambia', ZWE: 'Zimbabwe',
  XKX: 'Kosovo', PSE: 'Palestine', ESH: 'Western Sahara',
  HKG: 'Hong Kong', MAC: 'Macau', PRI: 'Puerto Rico'
};

export function getCountryName(alpha3) {
  return COUNTRY_NAMES[alpha3] || alpha3;
}
