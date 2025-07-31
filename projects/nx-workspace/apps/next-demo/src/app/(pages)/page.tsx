'use client';

import { Button, Card, Heading, Link, TextArea } from '@radix-ui/themes';
import {
  GithubOrganizationTeamStructure,
  GithubTeam,
  HTTP_HEADERS,
  HTTP_METHOD,
} from '@vigilant-broccoli/common-js';
import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

const API_ROUTES = {
  GET_CONFIGURATIONS: '/api/get-configurations',
  GET_FILE_OBJECT: '/api/get-file-object',
};

const start = new Date();
const end = new Date(start);
end.setHours(end.getHours() + 2);

const EVENTS = [
  {
    id: '1',
    title: 'event 1',
    start: start.toISOString(),
    end: end.toISOString(),
    date: start.toISOString().split('T')[0],
    resourceId: 'a',
  },
  {
    id: '2',
    title: 'event 2',
    start: start.toISOString(),
    end: end.toISOString(),
    date: start.toISOString().split('T')[0],
    resourceId: 'd1',
  },
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

  async function doggoEvent(type: string) {
    addCalendarEvent({
      summary: type,
      start: new Date(Date.now()).toISOString(),
      end: new Date(Date.now()).toISOString(),
    });
  }

  async function addCalendarEvent(event) {
    await fetch('/api/calendar/event', {
      method: HTTP_METHOD.POST,
      headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
      body: JSON.stringify(event),
    });

    // setEvents(prev => [
    //   ...prev,
    //   { title: 'New Event', date: new Date().toISOString().split('T')[0] },
    // ]);
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
      <Button onClick={addCalendarEvent}>Add Calendar Event</Button>
      <Button onClick={() => doggoEvent('poo')}>Poo!</Button>
      <Button onClick={() => doggoEvent('pee')}>Pee!</Button>
      <iframe
        src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FCopenhagen&showPrint=0&mode=AGENDA&showCalendars=0&title&src=ZGI3YzdhYzNlMjk3NDUyNTExOGY5MjQ5NmMwMzk0NjZlNmMzM2E5MjU5M2M3M2IyMGE1ZjY2N2YzMTI2NzI3N0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23ef6c00"
        style={{ border: 'solid 1px #777' }}
        width="800"
        height="600"
      ></iframe>
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
        events={events}
      />
    </>
  );
}
