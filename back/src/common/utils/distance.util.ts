/**
 * Utility functions for calculating distances between geographic coordinates
 * using the Haversine formula
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param point1 First coordinate point
 * @param point2 Second coordinate point
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
  point1: Coordinates,
  point2: Coordinates,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distances for an array of offices from a reference point
 * @param offices Array of offices with latitude and longitude
 * @param referencePoint Reference coordinates
 * @returns Array of offices with distance field added
 */
export function calculateDistancesForOffices<T extends Coordinates>(
  offices: T[],
  referencePoint: Coordinates,
): (T & { distance: number })[] {
  return offices.map((office) => ({
    ...office,
    distance: calculateHaversineDistance(referencePoint, office),
  }));
}

/**
 * Sort offices by distance from a reference point
 * @param offices Array of offices with distance field
 * @param ascending Whether to sort in ascending order (closest first)
 * @returns Sorted array of offices
 */
export function sortOfficesByDistance<T extends { distance: number }>(
  offices: T[],
  ascending: boolean = true,
): T[] {
  return offices.sort((a, b) => {
    return ascending ? a.distance - b.distance : b.distance - a.distance;
  });
}
