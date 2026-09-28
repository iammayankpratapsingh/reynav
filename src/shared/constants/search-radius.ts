// How far from a location we look for competitors. One definition, so the slider, the validation and the scan agree.
export const SEARCH_RADIUS_KM = {
  min: 5,
  max: 20,
  default: 10,
  step: 1,
} as const;
