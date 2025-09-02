import { FileSystemUtils, GithubService } from '@vigilant-broccoli/common-node';
import { NextResponse } from 'next/server';

async function parseFile(filename: string) {
  const json = FileSystemUtils.getObjectFromFilepath(filename);
  return {
    id: filename,
    filename,
    config: json,
  };
}

export async function GET() {
  const files = FileSystemUtils.getFilenamesFromDir('./github-configurations');
  const res = await Promise.all(
    files.map(async filename => parseFile(filename)),
  );
  return NextResponse.json(res);
}
