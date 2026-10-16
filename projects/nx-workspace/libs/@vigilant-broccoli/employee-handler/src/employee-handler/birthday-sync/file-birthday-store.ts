import { FileSystemUtils } from '@vigilant-broccoli/common-node';
import { BirthdayStore, TrackedBirthday } from './birthday-sync.models';

interface BirthdayStoreData {
  birthdays: TrackedBirthday[];
}

export const createFileBirthdayStore = (filepath: string): BirthdayStore => {
  let birthdays: TrackedBirthday[];
  try {
    const data = FileSystemUtils.getObjectFromFilepath(
      filepath,
    ) as BirthdayStoreData;
    birthdays = data.birthdays ?? [];
  } catch {
    birthdays = [];
    FileSystemUtils.writeJSON(filepath, { birthdays });
  }
  return {
    getTracked: () => birthdays,
    save: () => FileSystemUtils.writeJSON(filepath, { birthdays }),
  };
};
