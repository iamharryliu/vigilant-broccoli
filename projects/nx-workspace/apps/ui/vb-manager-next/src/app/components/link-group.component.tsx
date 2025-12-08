'use client';

type LinkType = 'browser' | 'shell';

interface LinkItem {
  label: string;
  href?: string; 
  command?: string; 
  type: LinkType;
}

interface LinkGroupProps {
  title: string;
  links: LinkItem[];
}

// Predefined color palette that cycles based on index
const COLOR_PALETTE = [
  'bg-blue-600 hover:bg-blue-700',
  'bg-purple-600 hover:bg-purple-700',
  'bg-green-600 hover:bg-green-700',
  'bg-red-600 hover:bg-red-700',
  'bg-orange-600 hover:bg-orange-700',
  'bg-pink-600 hover:bg-pink-700',
  'bg-indigo-600 hover:bg-indigo-700',
  'bg-teal-600 hover:bg-teal-700',
  'bg-cyan-600 hover:bg-cyan-700',
  'bg-emerald-600 hover:bg-emerald-700',
  'bg-violet-600 hover:bg-violet-700',
  'bg-rose-600 hover:bg-rose-700',
];

export function LinkGroupComponent({ title, links }: LinkGroupProps) {
  // Sort links alphabetically by label
  const sortedLinks = [...links].sort((a, b) => a.label.localeCompare(b.label));

  const handleShellCommand = async (command: string) => {
    try {
      const response = await fetch('/api/shell/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        console.error('Failed to execute shell command');
      }
    } catch (error) {
      console.error('Error executing shell command:', error);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {sortedLinks.map((link, index) => {
          const colorClass = COLOR_PALETTE[index % COLOR_PALETTE.length];
          const baseClass = `inline-flex justify-center px-4 py-1.5 ${colorClass} text-white rounded-full text-sm font-medium w-fit transition-colors`;

          if (link.type === 'shell' && link.command) {
            return (
              <button
                key={link.command}
                onClick={() => handleShellCommand(link.command!)}
                className={`${baseClass} cursor-pointer`}
              >
                {link.label}
              </button>
            );
          }

          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={baseClass}
            >
              {link.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
