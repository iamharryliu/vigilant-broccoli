import {
  GamCommand,
  GoogleService,
  RECURRENCE_RULE,
  runGamCommand,
} from '@vigilant-broccoli/google-workspace';
import {
  BIRTHDAY_ACTION,
  BirthdayAction,
  BirthdayTarget,
  BirthdayTrackedTarget,
  EmployeeBirthday,
} from './birthday-sync.models';

const DEFAULT_TARGET_ID = 'google-calendar';

export type GoogleCalendarBirthdayTargetOptions = {
  /** Google Calendar ID (or owner email) the recurring birthday events are created on. */
  calendarId: string;
  /** Override if running more than one Calendar target in the same sync
   *  (e.g. separate calendars per office) — each needs a distinct id so
   *  they're tracked independently. Defaults to "google-calendar". */
  id?: string;
};

const employeeName = (birthday: EmployeeBirthday): string =>
  `${birthday.employee.firstName} ${birthday.employee.lastName}`;

const eventTitle = (birthday: EmployeeBirthday): string =>
  `🎂 ${employeeName(birthday)} ${birthday.birthDate.slice(0, 4)}`;

const snapshotOf = (birthday: EmployeeBirthday) => ({
  birthDate: birthday.birthDate,
  employeeName: employeeName(birthday),
});

/**
 * A BirthdayTarget backed by a Google Calendar, via the same `gam` CLI
 * primitives the rest of this library already uses for Calendar. Company
 * config (which calendar) is supplied by the caller — nothing here is
 * company-specific.
 *
 * Note: recurring-event date updates (the UPDATE branch) are exercised via
 * `gam ... update event ... start allday ... end allday ...` on an existing
 * YEARLY-recurrence event. This mirrors the primitives already used for
 * one-off leave events elsewhere in this library, but there's no prior
 * usage in this codebase of updating an *already-recurring* event's date —
 * verify it shifts every future occurrence as expected before relying on
 * it for a real birthDate correction.
 */
export const createGoogleCalendarBirthdayTarget = (
  options: GoogleCalendarBirthdayTargetOptions,
): BirthdayTarget => {
  const { calendarId, id = DEFAULT_TARGET_ID } = options;

  const apply = async (
    action: BirthdayAction,
  ): Promise<BirthdayTrackedTarget | null> => {
    const { birthday } = action;

    if (action.kind === BIRTHDAY_ACTION.CREATE) {
      const externalId = await GoogleService.createRecurringCalendarEvent(
        calendarId,
        eventTitle(birthday),
        birthday.birthDate,
        RECURRENCE_RULE.ANNUAL,
        [birthday.employee.email],
      );
      return { externalId, synced: snapshotOf(birthday) };
    }

    if (action.kind === BIRTHDAY_ACTION.UPDATE) {
      await runGamCommand(
        GamCommand.updateCalendarEvent(
          calendarId,
          action.tracked.externalId,
          eventTitle(birthday),
          birthday.birthDate,
          birthday.birthDate,
          [birthday.employee.email],
          true,
        ),
        false,
      );
      return {
        externalId: action.tracked.externalId,
        synced: snapshotOf(birthday),
      };
    }

    await runGamCommand(
      GamCommand.deleteCalendarEvent(calendarId, action.tracked.externalId),
      false,
    );
    return null;
  };

  return { id, apply };
};
