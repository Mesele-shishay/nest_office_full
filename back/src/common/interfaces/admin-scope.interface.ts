export interface AdminScope {
  level: 'city' | 'state' | 'country';
  countryId?: number;
  stateId?: number;
  cityId?: number;
  assignedBy: string;
  assignedAt: Date;
}
