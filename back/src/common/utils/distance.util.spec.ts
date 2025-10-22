import {
  calculateHaversineDistance,
  calculateDistancesForOffices,
  sortOfficesByDistance,
} from './distance.util';

describe('Distance Utils', () => {
  describe('calculateHaversineDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // New York to Los Angeles (approximately 3944 km)
      const nyc = { latitude: 40.7128, longitude: -74.006 };
      const la = { latitude: 34.0522, longitude: -118.2437 };

      const distance = calculateHaversineDistance(nyc, la);

      // Allow for some margin of error (within 100km)
      expect(distance).toBeGreaterThan(3800);
      expect(distance).toBeLessThan(4100);
    });

    it('should return 0 for same coordinates', () => {
      const point = { latitude: 40.7128, longitude: -74.006 };
      const distance = calculateHaversineDistance(point, point);

      expect(distance).toBe(0);
    });

    it('should calculate short distances accurately', () => {
      // Two points in Manhattan (approximately 1.5 km apart)
      const point1 = { latitude: 40.7589, longitude: -73.9851 }; // Times Square
      const point2 = { latitude: 40.7505, longitude: -73.9934 }; // Central Park

      const distance = calculateHaversineDistance(point1, point2);

      expect(distance).toBeGreaterThan(1);
      expect(distance).toBeLessThan(2);
    });
  });

  describe('calculateDistancesForOffices', () => {
    it('should add distance field to offices', () => {
      const offices = [
        { id: '1', name: 'Office 1', latitude: 40.7128, longitude: -74.006 },
        { id: '2', name: 'Office 2', latitude: 40.7589, longitude: -73.9851 },
      ];

      const referencePoint = { latitude: 40.7505, longitude: -73.9934 };
      const officesWithDistances = calculateDistancesForOffices(
        offices,
        referencePoint,
      );

      expect(officesWithDistances).toHaveLength(2);
      expect(officesWithDistances[0]).toHaveProperty('distance');
      expect(officesWithDistances[1]).toHaveProperty('distance');
      expect(typeof officesWithDistances[0].distance).toBe('number');
    });
  });

  describe('sortOfficesByDistance', () => {
    it('should sort offices by distance ascending', () => {
      const offices = [
        { id: '1', name: 'Far Office', distance: 10.5 },
        { id: '2', name: 'Close Office', distance: 2.3 },
        { id: '3', name: 'Medium Office', distance: 5.7 },
      ];

      const sorted = sortOfficesByDistance(offices, true);

      expect(sorted[0].distance).toBe(2.3);
      expect(sorted[1].distance).toBe(5.7);
      expect(sorted[2].distance).toBe(10.5);
    });

    it('should sort offices by distance descending', () => {
      const offices = [
        { id: '1', name: 'Far Office', distance: 10.5 },
        { id: '2', name: 'Close Office', distance: 2.3 },
        { id: '3', name: 'Medium Office', distance: 5.7 },
      ];

      const sorted = sortOfficesByDistance(offices, false);

      expect(sorted[0].distance).toBe(10.5);
      expect(sorted[1].distance).toBe(5.7);
      expect(sorted[2].distance).toBe(2.3);
    });
  });
});
