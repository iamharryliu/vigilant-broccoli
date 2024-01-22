import { LocationService } from './location.service';

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};

Object.defineProperty(global, 'window', {
  value: { navigator: { geolocation: mockGeolocation } },
});

describe('LocationService', () => {
  describe('getLocation', () => {
    it('should return the correct location', (done) => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      };
      mockGeolocation.getCurrentPosition.mockImplementationOnce(
        (successCallback) => {
          successCallback(mockPosition);
        }
      );

      const locationService = new LocationService();
      locationService.getLocation().subscribe((location) => {
        expect(location).toEqual({
          latitude: mockPosition.coords.latitude,
          longitude: mockPosition.coords.longitude,
        });
        done();
      });
    });
  });
});
