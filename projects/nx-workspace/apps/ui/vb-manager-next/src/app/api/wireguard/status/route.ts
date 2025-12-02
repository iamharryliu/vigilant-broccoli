import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';

const execAsync = promisify(exec);

interface WireguardConnection {
  name: string;
  interface: string;
  address: string;
  status: 'active' | 'inactive';
}

interface WireguardStatus {
  connections: WireguardConnection[];
}

// Extract IP address from WireGuard config file
async function extractAddressFromConfig(configPath: string): Promise<string> {
  try {
    const configContent = await readFile(configPath, 'utf-8');
    const addressMatch = configContent.match(/^Address\s*=\s*(.+)/m);
    if (addressMatch) {
      return addressMatch[1].trim().split('/')[0];
    }
  } catch {
    // If we can't read the config, return empty
  }
  return '';
}

// Find interface by IP address and check if it's active
async function findActiveInterface(address: string): Promise<{ interfaceName: string; isActive: boolean }> {
  if (!address) {
    return { interfaceName: '', isActive: false };
  }

  try {
    // Check all utun interfaces for matching IP
    const { stdout: ifconfigOutput } = await execAsync(
      `ifconfig | grep -B1 "inet ${address} " | grep "^utun" | awk '{print $1}' | tr -d ':'`
    );

    const matchingIface = ifconfigOutput.trim();

    if (matchingIface) {
      // Check if interface is UP and RUNNING
      const { stdout: flagsOutput } = await execAsync(
        `ifconfig ${matchingIface} | grep "flags="`
      );

      const isActive = flagsOutput.includes('UP') && flagsOutput.includes('RUNNING');
      return { interfaceName: matchingIface, isActive };
    }
  } catch {
    // If interface check fails, mark as inactive
  }

  return { interfaceName: '', isActive: false };
}

// Process a single WireGuard config file
async function processConfigFile(configFile: string): Promise<WireguardConnection> {
  const configPath = `/opt/homebrew/etc/wireguard/${configFile}`;

  const address = await extractAddressFromConfig(configPath);
  const { interfaceName, isActive } = await findActiveInterface(address);

  return {
    name: configFile,
    interface: interfaceName || 'N/A',
    address: address || 'N/A',
    status: isActive ? 'active' : 'inactive',
  };
}

export async function GET() {
  try {
    // Get list of WireGuard configurations
    const { stdout: configsOutput } = await execAsync(
      'ls -1 /opt/homebrew/etc/wireguard/*.conf 2>/dev/null || echo ""'
    );

    const configFiles = configsOutput
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(path => path.split('/').pop() || '');

    if (configFiles.length === 0) {
      return NextResponse.json({ connections: [] });
    }

    // Build connection list using the same logic as wgls
    const connections = await Promise.all(
      configFiles.map(processConfigFile)
    );

    const status: WireguardStatus = {
      connections,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching WireGuard status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WireGuard status' },
      { status: 500 }
    );
  }
}
