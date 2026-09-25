// Where a search is measured from.
export type GeoTarget = {
  /** Display line, e.g. "Brampton, ON". */
  label: string;
  countryCode: string;
  latitude: number;
  longitude: number;
};
