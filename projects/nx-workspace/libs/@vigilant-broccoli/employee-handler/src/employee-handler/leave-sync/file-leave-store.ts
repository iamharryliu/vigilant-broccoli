import { FileSystemUtils } from '@vigilant-broccoli/common-node';
import { LeaveStore, TrackedLeave } from './leave-sync.models';

interface LeaveStoreData {
  leaves: TrackedLeave[];
}

export const createFileLeaveStore = (filepath: string): LeaveStore => {
  let leaves: TrackedLeave[];
  try {
    const data = FileSystemUtils.getObjectFromFilepath(
      filepath,
    ) as LeaveStoreData;
    leaves = data.leaves ?? [];
  } catch {
    leaves = [];
    FileSystemUtils.writeJSON(filepath, { leaves });
  }
  return {
    getTracked: () => leaves,
    save: () => FileSystemUtils.writeJSON(filepath, { leaves }),
  };
};
