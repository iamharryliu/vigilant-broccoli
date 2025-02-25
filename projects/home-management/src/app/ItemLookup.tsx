'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type Entry = {
  id: number;
  name: string;
  description: string;
  tags: string[];
};

const mockEntries: Entry[] = [
  {
    id: 1,
    name: 'Introduction to TypeScript',
    description: 'A beginner-friendly guide to learning TypeScript.',
    tags: ['typescript', 'programming', 'guide'],
  },
  {
    id: 2,
    name: 'Advanced Node.js Patterns',
    description: 'In-depth exploration of advanced design patterns in Node.js.',
    tags: ['nodejs', 'backend', 'patterns'],
  },
  {
    id: 3,
    name: 'Understanding Angular Directives',
    description: 'A comprehensive look at how directives work in Angular.',
    tags: ['angular', 'frontend', 'directives'],
  },
  {
    id: 4,
    name: 'Docker for Beginners',
    description:
      'A step-by-step tutorial to containerize your applications using Docker.',
    tags: ['docker', 'devops', 'containers'],
  },
  {
    id: 5,
    name: 'Mastering React Hooks',
    description: 'An advanced guide to using hooks effectively in React.',
    tags: ['react', 'frontend', 'hooks'],
  },
];

export default function ItemLookup() {
  const [query, setQuery] = useState('');

  const filteredEntries = mockEntries.filter(entry => {
    const lowerQuery = query.toLowerCase();
    return (
      entry.name.toLowerCase().includes(lowerQuery) ||
      entry.description.toLowerCase().includes(lowerQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });

  return (
    <div className="w-full mx-auto p-4">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Entry Search</CardTitle>
          <CardDescription>
            <Label>Search</Label>
            <Input
              type="text"
              placeholder="Search by name, description, or tag..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length > 0 ? (
            filteredEntries.map(entry => (
              <Card key={entry.id} className="mb-4 p-4 shadow rounded-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {entry.name}
                  </CardTitle>
                  <CardDescription>{entry.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <Carousel className="w-full max-w-xs">
                      <CarouselContent>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                  <span className="text-4xl font-semibold">
                                    {index + 1}
                                  </span>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">No entries found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
