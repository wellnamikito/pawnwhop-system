export interface Pawnshop {
  id: number;
  name: string;
  ownershipType: string;
  owner: string;
  district: string;
  address: string;
  phone?: string;
  openingHour?: number;
  closingHour?: number;
}

export interface PawnshopRequest {
  name: string;
  ownershipTypeId: number;
  ownerId: number;
  districtId: number;
  address: string;
  phone?: string;
  openingHour?: number;
  closingHour?: number;
}
