# IT Support

## Disk Utility

### Format

#### ExFAT

- Compatibility: ExFAT is designed for flash drives and external hard drives. It's widely compatible with Windows, macOS, and Linux systems.
- File Size Limit: It supports individual file sizes up to 16 exbibytes (EB) and volumes up to 128 pebibytes (PB).
- Partition Size: ExFAT has a maximum partition size of 64 zebibytes (ZB).
- Lack of Journaling: Unlike some other file systems like macOS Extended (HFS Plus), ExFAT does not support journaling, which means it's more susceptible to data corruption in case of unexpected shutdowns or power failures.

#### MS-DOS FAT (FAT32)

- Compatibility: FAT32 is the most compatible file system, supported by virtually all operating systems, including Windows, macOS, Linux, game consoles, and various other devices.
- File Size Limit: It supports individual file sizes up to 4 gigabytes (GB) minus 2 bytes.
- Partition Size: The maximum partition size for FAT32 is 2 terabytes (TB).
- Fragmentation: FAT32 tends to suffer from fragmentation more than other file systems, which can lead to slower performance over time.

#### macOS Extended (HFS Plus)

- Compatibility: HFS Plus is used primarily by macOS systems.
- File Size Limit: It supports individual file sizes up to 8 exbibytes (EB).
- Partition Size: The maximum partition size for HFS Plus depends on the version of macOS, but it's generally much larger than what most users would encounter.
- Journaling: HFS Plus supports journaling, which helps protect data integrity by recording changes to the file system before they're actually performed.

### Scheme

#### Master Boot Record (MBR):

- Limited to four primary partitions or three primary partitions and one extended partition (which can then be subdivided into multiple logical partitions).
- Typically used on older systems and for compatibility reasons.

#### GUID Partition Table (GPT):

- Supports up to 128 partitions.
- Generally used on modern systems, particularly those with UEFI firmware.
- Provides more robust support for larger drives and more partitions compared to MBR.

#### Apple Partition Map (APM):

- Used primarily on older Mac systems, particularly those using PowerPC processors.
- Limited compatibility compared to GPT, but necessary for compatibility with older Mac systems.

## HR System

## Onboard Process

- Setup workspace groups.
- Setup email signature.

## Offboard Process

- Data retention.
