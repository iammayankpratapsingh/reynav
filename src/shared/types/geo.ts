// Where a search is measured from.
export type GeoTarget = {
  /** Display line, e.g. "Brampton, ON". */
  label: string;
  countryCode: string;
  latitude: number;
  longitude: number;
};

/** A point plus how far around it to look, e.g. for nearby competitors. */
export type GeoArea = GeoTarget & {
  radiusKm: number;
};
