'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Text } from '@radix-ui/themes';
import { useAuth } from '../../providers/auth-provider';
import { HomeProject } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';

const CATEGORY_COLORS: Record<string, string> = {
  Renovation: 'orange',
  Painting: 'blue',
  Furniture: 'brown',
  Plumbing: 'cyan',
  Electrical: 'yellow',
  Garden: 'green',
  Cleaning: 'teal',
  Other: 'gray',
};

const STATUS_COLORS: Record<string, 'gray' | 'amber' | 'green'> = {
  Todo: 'gray',
  'In Progress': 'amber',
  Done: 'green',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useAuth();
  const [project, setProject] = useState<HomeProject | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/projects?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(setProject);
  }, [id, session?.access_token]);

  if (!project) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href={ROUTES.PROJECTS} className="text-sm text-gray-500 hover:text-gray-700">
        ← Back
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <Text size="6" weight="bold">{project.title}</Text>
        <Badge
          color={CATEGORY_COLORS[project.category] as never}
          variant="soft"
          size="2"
        >
          {project.category}
        </Badge>
        <Badge color={STATUS_COLORS[project.status]} variant="surface" size="2">
          {project.status}
        </Badge>
      </div>

      {project.description && (
        <Text size="3" color="gray" as="p">{project.description}</Text>
      )}

      {project.createdByEmail && (
        <Text size="2" color="gray" as="p">Added by {project.createdByEmail}</Text>
      )}

      <Text size="1" color="gray" as="p">
        Added {new Date(project.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
      </Text>
    </div>
  );
}
