// Field display name mappings for user-friendly labels
export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  'name': 'Name',
  'category': 'Category',
  'pricing.msrp': 'Price',
  'availability.status': 'Availability',
  'sustainability.carbonFootprint': 'Carbon Footprint',
  'sustainability.recyclabilityScore': 'Recyclability Score',
  'lifecycle.designLife': 'Design Life',
  'lifecycle.repairability': 'Repairability',
  'availability.leadTime': 'Lead Time',
  'subcategory': 'Subcategory',
  'description': 'Description',
  'pricing.currency': 'Currency',
  'lifecycle.warrantyPeriod': 'Warranty Period',
  'lifecycle.upgradeability': 'Upgradeability',
  'pricing.leaseOptions': 'Lease Options',
  'pricing.subscriptionModel': 'Subscription Model',
  'pricing.tradeInValue': 'Trade-in Value',
  'availability.leadTimeUnit': 'Lead Time Unit',
  'availability.regions': 'Regions',
  'availability.channels': 'Channels'
};

export const getFieldDisplayName = (field: string): string => {
  return FIELD_DISPLAY_NAMES[field] ||
    field.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || field;
};