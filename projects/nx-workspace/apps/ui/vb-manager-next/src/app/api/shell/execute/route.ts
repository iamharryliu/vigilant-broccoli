import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { homedir } from 'os';
import { LINK_TYPE } from '../../../constants/link-types';

const execAsync = promisify(exec);

const expandPath = (path: string): string => {
  if (path.startsWith('~/')) {
    return path.replace('~', homedir());
  }
  return path;
};

export async function POST(request: NextRequest) {
  try {
    const { type, target } = await request.json();

    if (!type || !target) {
      return NextResponse.json(
        { error: 'Both type and target must be provided' },
        { status: 400 }
      );
    }

    let shellCommand: string;

    switch (type) {
      case LINK_TYPE.VSCODE: {
        const expandedPath = expandPath(target);
        shellCommand = `code "${expandedPath}"`;
        break;
      }
      case LINK_TYPE.FILE_SYSTEM: {
        const expandedPath = expandPath(target);
        shellCommand = `open "${expandedPath}"`;
        break;
      }
      case LINK_TYPE.MAC_APPLICATION: {
        shellCommand = `open -a '${target}'`;
        break;
      }
      default:
        return NextResponse.json(
          { error: `Unsupported link type: ${type}` },
          { status: 400 }
        );
    }

    if (!shellCommand || typeof shellCommand !== 'string') {
      return NextResponse.json(
        { error: 'Failed to generate shell command' },
        { status: 400 }
      );
    }

    const { stdout, stderr } = await execAsync(shellCommand);

    return NextResponse.json({
      message: 'Command executed successfully',
      status: 'success',
      stdout,
      stderr
    });
  } catch (error) {
    console.error('Error executing shell command:', error);
    return NextResponse.json(
      { error: 'Failed to execute shell command', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
