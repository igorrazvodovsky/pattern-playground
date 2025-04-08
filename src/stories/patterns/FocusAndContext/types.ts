// Base interfaces for stuff.json data
export interface BaseItem {
  category: string;
}

export interface Product extends BaseItem {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  category: 'products';
}

export interface Attribute extends BaseItem {
  id: string;
  name: string;
  data_type: string;
  help_text: string;
  category: 'attributes';
}

export interface Component extends BaseItem {
  id: string;
  name: string;
  type: string;
  help_text: string;
  category: 'components';
}

export interface Rule extends BaseItem {
  id: string;
  name: string;
  type: string;
  message: string;
  category: 'rules';
}

export type MergedItem = Product | Attribute | Component | Rule;

// Heat Exchanger data types
export interface BaseAttribute {
  label?: string;
}

export interface SimpleAttribute extends BaseAttribute {
  value: number | string;
  unit?: string;
}

export interface DimensionAttribute extends BaseAttribute {
  value: {
    length: SimpleAttribute;
    width: SimpleAttribute;
    height: SimpleAttribute;
  };
}

export interface ThroughputAttribute extends BaseAttribute {
  maxThroughput: SimpleAttribute;
  averageThroughput: SimpleAttribute;
}

export interface PowerAttribute extends BaseAttribute {
  powerConsumption: SimpleAttribute;
  heatRecoveryEfficiency: SimpleAttribute;
}

export type HeatExchangerAttribute = SimpleAttribute | DimensionAttribute | ThroughputAttribute | PowerAttribute;

export interface Variant {
  variantId: string;
  label: string;
  description: string;
  attributes: {
    weight: SimpleAttribute;
    dimensions: {
      length: SimpleAttribute;
      width: SimpleAttribute;
      height: SimpleAttribute;
      label: string;
    };
    thermalEfficiency: SimpleAttribute;
  };
  predictiveMaintenance: {
    serviceSchedule: {
      inspectionInterval: string;
      nextInspectionDue: string;
      label: string;
    };
    replacementSchedule: {
      expectedLifetime: string;
      recommendedReplacement: string;
      label: string;
    };
  };
}

export interface MonitoringParameter {
  parameter: string;
  threshold: string;
  label: string;
}

export interface RelatedObject {
  name: string;
  objectType: string;
  label: string;
  description: string;
  relationship: string;
}

export interface RelatedObjectsGroup {
  parentAndChild: RelatedObject[];
  operationalPartners: RelatedObject[];
  componentParts: RelatedObject[];
  supportSystems: RelatedObject[];
  downstreamPartners: RelatedObject[];
}

export interface HeatExchangerData {
  card: {
    title: string;
    id: string;
    label: string;
    description: string;
    attributes: Record<string, HeatExchangerAttribute>;
    variants: Variant[];
    predictiveMaintenance: {
      serviceSchedule: {
        inspectionInterval: string;
        nextInspectionDue: string;
        label: string;
      };
      replacementSchedule: {
        expectedLifetime: string;
        recommendedReplacement: string;
        label: string;
      };
      monitoringParameters: MonitoringParameter[];
    };
    relatedObjects: {
      grouped: RelatedObjectsGroup;
    };
  };
}