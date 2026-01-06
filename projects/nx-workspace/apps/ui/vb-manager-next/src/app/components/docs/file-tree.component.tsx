'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileTreeProps {
  nodes: FileNode[];
  onFileSelect: (path: string) => void;
  selectedPath?: string;
}

export function FileTree({ nodes, onFileSelect, selectedPath }: FileTreeProps) {
  return (
    <div className="w-full">
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  );
}

interface FileTreeNodeProps {
  node: FileNode;
  onFileSelect: (path: string) => void;
  selectedPath?: string;
  depth?: number;
}

function FileTreeNode({
  node,
  onFileSelect,
  selectedPath,
  depth = 0,
}: FileTreeNodeProps) {
  // Check if this directory is in the path to the selected file
  const shouldBeExpanded = selectedPath ? selectedPath.startsWith(node.path + '/') || selectedPath === node.path : false;
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedPath === node.path;

  // Update expansion state when selectedPath changes
  useEffect(() => {
    if (shouldBeExpanded) {
      setIsExpanded(true);
    }
  }, [shouldBeExpanded]);

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'directory' ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            <Folder className="w-4 h-4 flex-shrink-0" />
          </>
        ) : (
          <>
            <span className="w-4 h-4 flex-shrink-0" />
            <File className="w-4 h-4 flex-shrink-0" />
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
