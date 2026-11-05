import { execFile } from 'child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  AUDIO_OUTPUTS,
  FILE_CONVERSION_FIELD,
  FILE_CONVERTER,
  FileConverter,
  findFileConversionCategory,
} from '../../constants/file-conversion';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const execFileAsync = promisify(execFile);

const CONVERSION_TIMEOUT_MS = 5 * 60 * 1000;
const MAX_BUFFER_BYTES = 10 * 1024 * 1024;
const TEMP_DIR_PREFIX = 'file-convert-';
const OCTET_STREAM = 'application/octet-stream';

const buildCommand = (
  converter: FileConverter,
  inputPath: string,
  outputPath: string,
  target: string,
): [string, string[]] => {
  switch (converter) {
    case FILE_CONVERTER.SIPS:
      return ['sips', ['-s', 'format', target, inputPath, '--out', outputPath]];
    case FILE_CONVERTER.TEXTUTIL:
      return [
        'textutil',
        ['-convert', target, inputPath, '-output', outputPath],
      ];
    case FILE_CONVERTER.FFMPEG:
      // -vn drops the video stream when extracting audio from a video.
      return [
        'ffmpeg',
        [
          '-y',
          '-i',
          inputPath,
          ...(AUDIO_OUTPUTS.includes(target) ? ['-vn'] : []),
          outputPath,
        ],
      ];
  }
};

const badRequest = (error: string) =>
  NextResponse.json({ error }, { status: HTTP_STATUS_CODES.BAD_REQUEST });

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get(FILE_CONVERSION_FIELD.FILE);
  const target = formData.get(FILE_CONVERSION_FIELD.TARGET);

  if (!(file instanceof File) || typeof target !== 'string') {
    return badRequest('file and target are required');
  }

  const category = findFileConversionCategory(file.name);
  if (!category) return badRequest(`Unsupported input file: ${file.name}`);
  if (!category.outputs.includes(target)) {
    return badRequest(`Cannot convert ${category.label} to ${target}`);
  }

  const workDir = await mkdtemp(path.join(tmpdir(), TEMP_DIR_PREFIX));
  try {
    const inputPath = path.join(workDir, path.basename(file.name));
    const outputName = `${path.parse(file.name).name}.${target}`;
    // Separate subdirectory so a same-extension output never overwrites the input.
    const outputPath = path.join(workDir, 'out', outputName);
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));
    await mkdir(path.dirname(outputPath));

    const [command, args] = buildCommand(
      category.converter,
      inputPath,
      outputPath,
      target,
    );
    try {
      await execFileAsync(command, args, {
        timeout: CONVERSION_TIMEOUT_MS,
        maxBuffer: MAX_BUFFER_BYTES,
      });
    } catch (error) {
      const stderr = (error as { stderr?: string }).stderr?.trim();
      return NextResponse.json(
        { error: stderr?.split('\n').pop() || `${command} failed` },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
      );
    }

    const output = await readFile(outputPath);
    return new NextResponse(output, {
      headers: {
        'Content-Type': OCTET_STREAM,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(outputName)}"`,
      },
    });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
