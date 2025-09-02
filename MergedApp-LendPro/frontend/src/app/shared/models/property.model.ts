export interface Property {
  id: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: string;
  description: string;
  imageUrl: string;
  isFavorite: boolean;
  yearBuilt?: number;
}

export interface PropertySearchFilters {
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  propertyType?: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
}

export interface PropertySearchResult {
  properties: Property[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PropertyLocations {
  states: string[];
  cities: string[];
}