import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Readable } from 'stream';
import { LocalBucketProvider } from './local.provider';

const TMP_PREFIX = 'local-bucket-provider-';
const INVALID_PATH_ERROR = 'Invalid file path';
const PRESIGNED_ERROR = 'does not support presigned URLs';

describe('LocalBucketProvider', () => {
  let bucketDir: string;
  let provider: LocalBucketProvider;

  beforeEach(async () => {
    bucketDir = await fs.mkdtemp(path.join(os.tmpdir(), TMP_PREFIX));
    provider = new LocalBucketProvider({ bucketName: bucketDir });
  });

  afterEach(async () => {
    await fs.rm(bucketDir, { recursive: true, force: true });
  });

  it('reads back the bytes that were uploaded', async () => {
    const bytes = Buffer.from([0, 1, 2, 250, 255]);
    await provider.upload('file.bin', bytes);
    expect((await provider.read('file.bin')).equals(bytes)).toBe(true);
  });

  it('creates subdirectories for nested destination names', async () => {
    await provider.upload('a/b/c.txt', Buffer.from('nested'));
    const stats = await fs.stat(path.join(bucketDir, 'a', 'b'));
    expect(stats.isDirectory()).toBe(true);
    expect((await provider.read('a/b/c.txt')).toString()).toBe('nested');
  });

  it('round-trips a Readable through uploadStream', async () => {
    await provider.uploadStream(
      'dir/stream.txt',
      Readable.from([Buffer.from('hello '), Buffer.from('stream')]),
    );
    expect((await provider.read('dir/stream.txt')).toString()).toBe(
      'hello stream',
    );
  });

  describe('list', () => {
    it('returns relative names with size and updatedAt, including nested files', async () => {
      await provider.upload('top.txt', Buffer.from('12345'));
      await provider.upload('sub/inner.txt', Buffer.from('abc'));

      const files = await provider.list();
      const byName = Object.fromEntries(files.map(file => [file.name, file]));

      expect(Object.keys(byName).sort()).toEqual(
        ['top.txt', path.join('sub', 'inner.txt')].sort(),
      );
      expect(byName['top.txt'].size).toBe(5);
      expect(byName[path.join('sub', 'inner.txt')].size).toBe(3);
      expect(byName['top.txt'].updatedAt.getTime()).toBeGreaterThan(0);
    });

    it('returns [] when the bucket directory does not exist', async () => {
      const missing = new LocalBucketProvider({
        bucketName: path.join(bucketDir, 'missing'),
      });
      expect(await missing.list()).toEqual([]);
    });
  });

  it('reports whether a file exists', async () => {
    await provider.upload('present.txt', Buffer.from('x'));
    expect(await provider.exists('present.txt')).toBe(true);
    expect(await provider.exists('absent.txt')).toBe(false);
  });

  it('downloads a copy to the destination path', async () => {
    await provider.upload('src.txt', Buffer.from('copy me'));
    const destination = path.join(
      bucketDir,
      '..',
      `${path.basename(bucketDir)}-copy.txt`,
    );
    try {
      await provider.download('src.txt', destination);
      expect((await fs.readFile(destination)).toString()).toBe('copy me');
    } finally {
      await fs.rm(destination, { force: true });
    }
  });

  it('delete removes the file from exists and list', async () => {
    await provider.upload('gone.txt', Buffer.from('x'));
    await provider.delete('gone.txt');
    expect(await provider.exists('gone.txt')).toBe(false);
    expect(await provider.list()).toEqual([]);
  });

  describe('path traversal', () => {
    const outsideAbsolute = path.join(os.tmpdir(), 'outside-bucket.txt');
    const names = ['../escape.txt', outsideAbsolute];

    it.each(names)('upload rejects %s', async name => {
      await expect(provider.upload(name, Buffer.from('x'))).rejects.toThrow(
        INVALID_PATH_ERROR,
      );
    });

    it.each(names)('read rejects %s', async name => {
      await expect(provider.read(name)).rejects.toThrow(INVALID_PATH_ERROR);
    });

    it.each(names)('delete rejects %s', async name => {
      await expect(provider.delete(name)).rejects.toThrow(INVALID_PATH_ERROR);
    });
  });

  it('rejects presigned URL requests', async () => {
    await expect(provider.getUploadUrl()).rejects.toThrow(PRESIGNED_ERROR);
    await expect(provider.getDownloadUrl()).rejects.toThrow(PRESIGNED_ERROR);
  });
});
