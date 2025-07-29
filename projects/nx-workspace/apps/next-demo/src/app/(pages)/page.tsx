'use client';

import { Button, Card, Heading, Link, TextArea } from '@radix-ui/themes';
import {
  GithubOrganizationTeamStructure,
  GithubTeam,
} from '@vigilant-broccoli/common-js';
import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

const API_ROUTES = {
  GET_CONFIGURATIONS: '/api/get-configurations',
  GET_FILE_OBJECT: '/api/get-file-object',
};

const EVENTS = [
  { title: 'event 1', date: new Date().toISOString().split('T')[0] },
  { title: 'event 2', date: new Date().toISOString().split('T')[0] },
];

export default function Index() {
  const [files, setFiles] = useState<string[]>([]);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [jsonConfig, setJsonConfig] = useState('');
  const [events, setEvents] = useState(EVENTS);

  useEffect(() => {
    async function init() {
      const res = await fetch(API_ROUTES.GET_CONFIGURATIONS);
      setFiles(await res.json());
    }
    init();
  }, []);

  async function test(filename: string) {
    const response = await fetch(
      `${API_ROUTES.GET_FILE_OBJECT}?filename=${filename}`,
    );
    const json = await response.json();
    setJsonConfig(JSON.stringify(await json, null, 2));
    setTeamNames(extractTeamLinks(json));
  }

  async function addCalendarEvent() {
    setEvents(prev => [
      ...prev,
      { title: 'New Event', date: new Date().toISOString().split('T')[0] },
    ]);
  }

  function extractTeamLinks(
    orgData: GithubOrganizationTeamStructure,
  ): string[] {
    const links: string[] = [];

    function recurse(teams: GithubTeam[]) {
      for (const team of teams) {
        links.push(
          `https://github.com/orgs/${orgData.organizationName}/teams/${team.name}`,
        );
        recurse(team.teams);
      }
    }

    recurse(orgData.teams);
    return links;
  }

  return (
    <>
      <Heading>Github Manager</Heading>
      <Heading>Configurations</Heading>
      {files.map(file => (
        <Card key="file" onClick={() => test(file)}>
          {file}
        </Card>
      ))}
      {jsonConfig ? (
        <>
          <Heading>Configuration</Heading>
          <TextArea
            value={jsonConfig}
            onChange={e => setJsonConfig(e.target.value)}
          />
          <Heading size="3">Team Links </Heading>
          {teamNames.map(name => (
            <div key={name}>
              <Link href={name} target="blank" key={name}>
                {name}
              </Link>
            </div>
          ))}
        </>
      ) : null}
      <Heading>Calendar Implementation</Heading>
      <Heading>Calendar Month View</Heading>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
      />
      <Heading>Timeline View</Heading>
      <FullCalendar
        plugins={[resourceTimelinePlugin]}
        initialView="resourceTimeline"
        resources={[
          { id: 'a', title: 'Room A' },
          { id: 'b', title: 'Room B' },
          { id: 'c', title: 'Room C', eventColor: 'green' },
          {
            id: 'd',
            title: 'Building D',
            children: [
              { id: 'd1', title: 'Room D1' },
              { id: 'd2', title: 'Room D2' },
            ],
          },
        ]}
        events={[
          {
            id: '1',
            resourceId: 'a',
            title: 'Meeting',
            start: '2025-07-29T10:00:00',
            end: '2025-07-29T12:00:00',
          },
          {
            id: '2',
            resourceId: 'd1',
            title: 'Training',
            start: '2025-07-29T13:00:00',
            end: '2025-07-29T15:00:00',
          },
        ]}
      />
      <Button onClick={addCalendarEvent}>Add Calendar Event</Button>
    </>
  );
}
