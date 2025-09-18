// Shared type definitions for data layer

export interface User {
  id: string;
  name: string;
  icon: string;
  type: string;
  description: string;
  searchableText: string;
  metadata: Record<string, unknown>;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  type: string;
  description: string;
  searchableText: string;
  metadata: Record<string, unknown>;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  searchableText: string;
  metadata: {
    category: string;
    subcategory: string;
    specifications: Record<string, string | number | boolean>;
    lifecycle: {
      designLife: number | string;
      designLifeUnit: string;
      warrantyPeriod: number;
      repairability: string;
      upgradeability: string;
    };
    sustainability: {
      carbonFootprint: number;
      unit: string;
      recycledContentOverall: number;
      recyclabilityScore: number;
      certifications: string[];
    };
    pricing: {
      msrp: number;
      currency: string;
      leaseOptions: boolean;
      subscriptionModel: boolean;
      tradeInValue: number;
    };
    availability: {
      status: string;
      leadTime: number;
      leadTimeUnit: string;
      regions: string[];
      channels: string[];
    };
  };
}