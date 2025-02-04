import { LocationService } from './location.service';

const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

Object.defineProperty(global, 'window', {
  value: { navigator: { geolocation: mockGeolocation } },
});

describe('LocationService', () => {
  describe('getLocation', () => {
    it('should return the correct location', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      };
      mockGeolocation.getCurrentPosition.mockImplementationOnce(
        successCallback => {
          successCallback(mockPosition);
        },
      );

      const locationService = new LocationService();
      const location = await locationService.getLocation().toPromise(); // assuming it's an observable
      expect(location).toEqual({
        latitude: mockPosition.coords.latitude,
        longitude: mockPosition.coords.longitude,
      });
    });
  });
});
