import { GamCommand } from './gam.api';

const testCases = {
  twoDayVacation: {
    input: {
      email: 'email@example.com',
      summary: 'Vacation',
      startDate: '2024-12-22',
      endDate: '2024-12-23',
      attendees: [],
      allday: true,
    },
    expected:
      'gam calendar email@example.com add event summary "Vacation" start allday "2024-12-22" end allday "2024-12-24"',
  },
  singleDay: {
    input: {
      email: 'email@example.com',
      summary: 'Single Day',
      startDate: '2024-12-22',
      endDate: '2024-12-22',
      attendees: [],
      allday: true,
    },
    expected:
      'gam calendar email@example.com add event summary "Single Day" start allday "2024-12-22" end allday "2024-12-23"',
  },
  threeDay: {
    input: {
      email: 'email@example.com',
      summary: '3 Day Event',
      startDate: '2024-12-22',
      endDate: '2024-12-24',
      attendees: [],
      allday: true,
    },
    expected:
      'gam calendar email@example.com add event summary "3 Day Event" start allday "2024-12-22" end allday "2024-12-25"',
  },
  monthBoundary: {
    input: {
      email: 'email@example.com',
      summary: 'Month End',
      startDate: '2024-01-30',
      endDate: '2024-01-31',
      attendees: [],
      allday: true,
    },
    expected:
      'gam calendar email@example.com add event summary "Month End" start allday "2024-01-30" end allday "2024-02-01"',
  },
  yearBoundary: {
    input: {
      email: 'email@example.com',
      summary: 'New Year',
      startDate: '2024-12-31',
      endDate: '2024-12-31',
      attendees: [],
      allday: true,
    },
    expected:
      'gam calendar email@example.com add event summary "New Year" start allday "2024-12-31" end allday "2025-01-01"',
  },
  leapYear: {
    input: {
      email: 'email@example.com',
      summary: 'Leap Day',
      startDate: '2024-02-29',
      endDate: '2024-02-29',
      attendees: [],
      allday: true,
    },
    expected:
      'gam calendar email@example.com add event summary "Leap Day" start allday "2024-02-29" end allday "2024-03-01"',
  },
  nonAllDay: {
    input: {
      email: 'email@example.com',
      summary: 'Conference',
      startDate: '2024-12-22',
      endDate: '2024-12-23',
      attendees: [],
      allday: false,
    },
    expected:
      'gam calendar email@example.com add event summary "Conference" start "2024-12-22" end "2024-12-23"',
  },
  alldayUndefined: {
    input: {
      email: 'email@example.com',
      summary: 'Meeting',
      startDate: '2024-12-22',
      endDate: '2024-12-23',
      attendees: [],
      allday: undefined,
    },
    expected:
      'gam calendar email@example.com add event summary "Meeting" start "2024-12-22" end "2024-12-23"',
  },
};

describe('GamCommand.createCalendarEvent', () => {
  describe('Bug: 2-day vacation showing as 1 day in calendar', () => {
    it('should create a 2-day vacation (Dec 22-23) that shows correctly in calendar', () => {
      const { input, expected } = testCases.twoDayVacation;
      const result = GamCommand.createCalendarEvent(
        input.email,
        input.summary,
        input.startDate,
        input.endDate,
        input.attendees,
        input.allday
      );
      expect(result).toBe(expected);
    });
  });

  describe('Edge cases for all-day events', () => {
    it('should handle single-day all-day event correctly', () => {
      // Single day event: Dec 22 only
      const { input, expected } = testCases.singleDay;
      const result = GamCommand.createCalendarEvent(
        input.email,
        input.summary,
        input.startDate,
        input.endDate,
        input.attendees,
        input.allday
      );
      // Should end on Dec 23 (exclusive end)
      expect(result).toBe(expected);
    });

    it('should handle 3-day all-day event correctly', () => {
      // 3-day event: Dec 22-24
      const { input, expected } = testCases.threeDay;
      const result = GamCommand.createCalendarEvent(
        input.email,
        input.summary,
        input.startDate,
        input.endDate,
        input.attendees,
        input.allday
      );
      // Should end on Dec 25 (exclusive end)
      expect(result).toBe(expected);
    });

    it('should handle month boundary correctly', () => {
      // Event ending on last day of month
      const { input, expected } = testCases.monthBoundary;
      const result = GamCommand.createCalendarEvent(
        input.email,
        input.summary,
        input.startDate,
        input.endDate,
        input.attendees,
        input.allday
      );
      // Should roll over to next month
      expect(result).toBe(expected);
    });

    it('should handle year boundary correctly', () => {
      // Event crossing year boundary
      const { input, expected } = testCases.yearBoundary;
      const result = GamCommand.createCalendarEvent(
        input.email,
        input.summary,
        input.startDate,
        input.endDate,
        input.attendees,
        input.allday
      );
      // Should roll over to next year
      expect(result).toBe(expected);
    });

    it('should handle leap year correctly', () => {
      // Feb 29 in leap year
      const { input, expected } = testCases.leapYear;
      const result = GamCommand.createCalendarEvent(
        input.email,
        input.summary,
        input.startDate,
        input.endDate,
        input.attendees,
        input.allday
      );
      // Should correctly move to March 1
      expect(result).toBe(expected);
    });

    it('should NOT add day for non-all-day events', () => {
      // Regular timed event spanning 2 days
      const { input, expected } = testCases.nonAllDay;
      const result = GamCommand.createCalendarEvent(
        input.email,
        input.summary,
        input.startDate,
        input.endDate,
        input.attendees,
        input.allday
      );
      // Should NOT add a day - end stays as Dec 23
      expect(result).toBe(expected);
    });

    it('should handle when allday is undefined (defaults to false)', () => {
      const { input, expected } = testCases.alldayUndefined;
      const result = GamCommand.createCalendarEvent(
        input.email,
        input.summary,
        input.startDate,
        input.endDate,
        input.attendees,
        input.allday
      );
      // Should NOT add a day when allday is undefined
      expect(result).toBe(expected);
    });
  });
});
