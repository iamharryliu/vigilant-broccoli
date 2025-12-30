import { buildCalendarUrl, encodeCalendarSrc } from './google-calendar.utils';
import { CalendarConfig } from './google-calendar.models';

describe('google-calendar.utils', () => {
  describe('encodeCalendarSrc', () => {
    it('should encode a string to base64 without padding', () => {
      const result = encodeCalendarSrc('harryliu1995@gmail.com');
      expect(result).toBe('aGFycnlsaXUxOTk1QGdtYWlsLmNvbQ');
      expect(result).not.toContain('=');
    });

    it('should handle email addresses correctly', () => {
      const result = encodeCalendarSrc('harry.liu@elva11.se');
      expect(result).toBe('aGFycnkubGl1QGVsdmExMS5zZQ');
    });

    it('should handle long calendar IDs', () => {
      const longId = 'c_63c9b34bb2c7371df04be8e4e422fd95bd3a439037771cea73b674b2e16a5b0c@group.calendar.google.com';
      const result = encodeCalendarSrc(longId);
      expect(result).toBe('Y182M2M5YjM0YmIyYzczNzFkZjA0YmU4ZTRlNDIyZmQ5NWJkM2E0MzkwMzc3NzFjZWE3M2I2NzRiMmUxNmE1YjBjQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20');
      expect(result).not.toContain('=');
    });

    it('should handle holiday calendar IDs', () => {
      const result = encodeCalendarSrc('en.swedish#holiday@group.v.calendar.google.com');
      expect(result).toBe('ZW4uc3dlZGlzaCNob2xpZGF5QGdyb3VwLnYuY2FsZW5kYXIuZ29vZ2xlLmNvbQ');
    });
  });

  describe('buildCalendarUrl', () => {
    it('should build a personal calendar URL with title', () => {
      const config: CalendarConfig = {
        height: 600,
        wkst: 2,
        ctz: 'Europe/Copenhagen',
        showPrint: 0,
        mode: 'AGENDA',
        title: 'Personal Calendar',
        ownerCalendars: [
          { email: 'harryliu1995@gmail.com', color: '%237cb342' },
          { email: 'harry.liu@elva11.se', color: '%23e67c73' },
        ],
        sharedCalendars: [
          { id: 'f61b08e940f7c4fb8becf0d419c8c09f7e0c46d6d03343637aef5837c766a09b@group.calendar.google.com', color: '%23d81b60' },
          { id: 'c_63c9b34bb2c7371df04be8e4e422fd95bd3a439037771cea73b674b2e16a5b0c@group.calendar.google.com', color: '%234285f4' },
          { id: 'en.swedish#holiday@group.v.calendar.google.com', color: '%23b39ddb' },
          { id: 'ht3jlfaac5lfd6263ulfh4tql8@group.calendar.google.com', color: '%23ad1457' },
        ],
      };

      const expectedUrl = 'https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FCopenhagen&showPrint=0&mode=AGENDA&title=Personal%20Calendar&&src=aGFycnlsaXUxOTk1QGdtYWlsLmNvbQ&src=aGFycnkubGl1QGVsdmExMS5zZQ&color=%237cb342&color=%23e67c73&color=%23d81b60&color=%234285f4&color=%23b39ddb&color=%23ad1457&src=ZjYxYjA4ZTk0MGY3YzRmYjhiZWNmMGQ0MTljOGMwOWY3ZTBjNDZkNmQwMzM0MzYzN2FlZjU4MzdjNzY2YTA5YkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=Y182M2M5YjM0YmIyYzczNzFkZjA0YmU4ZTRlNDIyZmQ5NWJkM2E0MzkwMzc3NzFjZWE3M2I2NzRiMmUxNmE1YjBjQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=ZW4uc3dlZGlzaCNob2xpZGF5QGdyb3VwLnYuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&src=aHQzamxmYWFjNWxmZDYyNjN1bGZoNHRxbDhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ';

      const result = buildCalendarUrl(config);
      expect(result).toBe(expectedUrl);
    });

    it('should build a work calendar URL without title', () => {
      const config: CalendarConfig = {
        height: 600,
        wkst: 2,
        ctz: 'Europe/Stockholm',
        showPrint: 0,
        mode: 'AGENDA',
        ownerCalendars: [
          { email: 'harry.liu@elva11.se', color: '%23039be5' },
        ],
        sharedCalendars: [
          { id: 'c_63c9b34bb2c7371df04be8e4e422fd95bd3a439037771cea73b674b2e16a5b0c@group.calendar.google.com', color: '%23d81b60' },
          { id: 'en-gb.swedish#holiday@group.v.calendar.google.com', color: '%230b8043' },
        ],
      };

      const expectedUrl = 'https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FStockholm&showPrint=0&mode=AGENDA&src=aGFycnkubGl1QGVsdmExMS5zZQ&src=Y182M2M5YjM0YmIyYzczNzFkZjA0YmU4ZTRlNDIyZmQ5NWJkM2E0MzkwMzc3NzFjZWE3M2I2NzRiMmUxNmE1YjBjQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=ZW4tZ2Iuc3dlZGlzaCNob2xpZGF5QGdyb3VwLnYuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23039be5&color=%23d81b60&color=%230b8043';

      const result = buildCalendarUrl(config);
      expect(result).toBe(expectedUrl);
    });

    it('should handle calendars without colors', () => {
      const config: CalendarConfig = {
        height: 600,
        wkst: 1,
        ctz: 'America/New_York',
        showPrint: 0,
        mode: 'WEEK',
        ownerCalendars: [
          { email: 'test@example.com' },
        ],
        sharedCalendars: [],
      };

      const result = buildCalendarUrl(config);
      expect(result).toContain('height=600');
      expect(result).toContain('wkst=1');
      expect(result).toContain('ctz=America%2FNew_York');
      expect(result).toContain('mode=WEEK');
      expect(result).toContain('src=dGVzdEBleGFtcGxlLmNvbQ');
      expect(result).not.toContain('color=');
    });

    it('should handle mixed calendars with and without colors', () => {
      const config: CalendarConfig = {
        height: 800,
        wkst: 1,
        ctz: 'UTC',
        showPrint: 1,
        mode: 'MONTH',
        ownerCalendars: [
          { email: 'owner1@example.com', color: '%23FF0000' },
          { email: 'owner2@example.com' }, // No color
        ],
        sharedCalendars: [
          { id: 'shared@group.calendar.google.com', color: '%2300FF00' },
        ],
      };

      const result = buildCalendarUrl(config);
      expect(result).toContain('color=%23FF0000');
      expect(result).toContain('color=%2300FF00');
      // Should only have 2 color parameters
      const colorCount = (result.match(/color=/g) || []).length;
      expect(colorCount).toBe(2);
    });

    it('should properly encode special characters in timezone', () => {
      const config: CalendarConfig = {
        height: 600,
        wkst: 2,
        ctz: 'America/Los_Angeles',
        showPrint: 0,
        mode: 'AGENDA',
        ownerCalendars: [
          { email: 'test@example.com' },
        ],
        sharedCalendars: [],
      };

      const result = buildCalendarUrl(config);
      expect(result).toContain('ctz=America%2FLos_Angeles');
    });

    it('should include double ampersand when title is present', () => {
      const config: CalendarConfig = {
        height: 600,
        wkst: 2,
        ctz: 'UTC',
        showPrint: 0,
        mode: 'AGENDA',
        title: 'My Calendar',
        ownerCalendars: [{ email: 'test@example.com' }],
        sharedCalendars: [],
      };

      const result = buildCalendarUrl(config);
      expect(result).toContain('title=My%20Calendar&&');
    });

    it('should not include double ampersand when title is absent', () => {
      const config: CalendarConfig = {
        height: 600,
        wkst: 2,
        ctz: 'UTC',
        showPrint: 0,
        mode: 'AGENDA',
        ownerCalendars: [{ email: 'test@example.com' }],
        sharedCalendars: [],
      };

      const result = buildCalendarUrl(config);
      expect(result).not.toContain('&&');
    });

    it('should handle empty shared calendars array', () => {
      const config: CalendarConfig = {
        height: 600,
        wkst: 2,
        ctz: 'UTC',
        showPrint: 0,
        mode: 'AGENDA',
        ownerCalendars: [
          { email: 'test@example.com', color: '%23FF0000' },
        ],
        sharedCalendars: [],
      };

      const result = buildCalendarUrl(config);
      expect(result).toBeTruthy();
      expect(result).toContain('src=');
      expect(result).toContain('color=%23FF0000');
    });

    it('should handle empty owner calendars array', () => {
      const config: CalendarConfig = {
        height: 600,
        wkst: 2,
        ctz: 'UTC',
        showPrint: 0,
        mode: 'AGENDA',
        ownerCalendars: [],
        sharedCalendars: [
          { id: 'shared@group.calendar.google.com', color: '%2300FF00' },
        ],
      };

      const result = buildCalendarUrl(config);
      expect(result).toBeTruthy();
      expect(result).toContain('src=');
      expect(result).toContain('color=%2300FF00');
    });
  });
});
