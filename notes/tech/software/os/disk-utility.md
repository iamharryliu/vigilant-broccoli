# Disk Utility

Formatting, partitioning, and repairing disks — concepts and tools across macOS, Windows, and Linux.

## Table of Contents

- [Tools by OS](#tools-by-os)
- [File System Formats](#file-system-formats)
- [Partition Map Schemes](#partition-map-schemes)
- [Operations](#operations)
- [Encryption](#encryption)
- [Which Format Should I Use?](#which-format-should-i-use)

## Tools by OS

| OS      | GUI Tool                         | CLI Tool                   |
| ------- | -------------------------------- | -------------------------- |
| macOS   | Disk Utility                     | `diskutil`                 |
| Windows | Disk Management (`diskmgmt.msc`) | `diskpart`                 |
| Linux   | GParted                          | `fdisk`, `parted`, `lsblk` |

## File System Formats

| Format                 | Max File Size | Max Volume Size | Read/Write On                                                           | Notes                                                           |
| ---------------------- | ------------- | --------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| APFS                   | ~8 EB         | ~8 EB           | macOS (10.13+)                                                          | Default for SSDs, snapshots, native encryption, space sharing   |
| Mac OS Extended (HFS+) | ~8 EB         | ~8 ZB           | macOS                                                                   | Legacy default before APFS, journaled for crash protection      |
| NTFS                   | ~16 EB        | ~8 PB           | Windows (read/write), macOS (read-only), Linux (read/write via ntfs-3g) | Windows native, journaled                                       |
| ext4                   | 16 TB         | 1 EB            | Linux                                                                   | Linux native, journaled, not natively readable by macOS/Windows |
| MS-DOS (FAT32)         | 4 GB          | 2 TB            | macOS, Windows, Linux                                                   | Widely compatible, no journaling, poor for large files          |
| ExFAT                  | ~16 EB        | ~128 PB         | macOS, Windows, Linux                                                   | FAT32 successor without the 4 GB file cap, no journaling        |

## Partition Map Schemes

| Scheme                    | Compatible With                             | Notes                                                                |
| ------------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| GUID Partition Map (GPT)  | macOS, Windows (UEFI), Linux                | Required for drives >2 TB and modern UEFI boot, up to 128 partitions |
| Master Boot Record (MBR)  | Windows (legacy BIOS), Linux, older systems | Legacy scheme, 2 TB size limit, max 4 primary partitions             |
| Apple Partition Map (APM) | Legacy PowerPC Macs                         | Obsolete, only needed for pre-2006 Macs                              |

## Operations

| Operation     | What It Does                                          | macOS     | Windows                     | Linux              |
| ------------- | ----------------------------------------------------- | --------- | --------------------------- | ------------------ |
| Format/Erase  | Reformats a volume/disk to a chosen file system       | Erase     | Format                      | `mkfs.<fstype>`    |
| Partition     | Divides a physical disk into multiple logical volumes | Partition | Shrink/New Simple Volume    | `fdisk` / `parted` |
| Check/Repair  | Checks and repairs file system errors                 | First Aid | `chkdsk`                    | `fsck`             |
| Clone/Restore | Copies one volume's contents onto another             | Restore   | (third-party, e.g. Macrium) | `dd`, `rsync`      |

## Encryption

| OS      | Built-in Encryption     | Notes                                                                            |
| ------- | ----------------------- | -------------------------------------------------------------------------------- |
| macOS   | FileVault (APFS/HFS+)   | Set at erase/format time, or `diskutil apfs encryptVolume` on an existing volume |
| Windows | BitLocker               | Requires Pro/Enterprise edition for full control                                 |
| Linux   | LUKS (via `cryptsetup`) | Encrypts the block device below the file system                                  |

## Which Format Should I Use?

| Use Case                                          | Recommended Format               | Why                                                                   |
| ------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| Mac-only backup drive                             | APFS (Encrypted)                 | No file-size cap, native encryption, best macOS performance           |
| Windows-only drive                                | NTFS                             | Native journaling, full read/write, no size limits                    |
| Linux-only drive                                  | ext4                             | Native journaling, full read/write, no size limits                    |
| Cross-platform drive (Mac + Windows + Linux)      | ExFAT                            | No 4 GB file cap, read/write on all three; trade-off is no journaling |
| Small USB drive for transferring small files only | MS-DOS (FAT32)                   | Universally compatible, including older devices/media players         |
| Boot drive (modern Mac/PC)                        | GPT partition map + APFS or NTFS | Required for UEFI boot and drives >2 TB                               |
