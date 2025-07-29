'use client';

import { Button, Card, Link, TextArea } from '@radix-ui/themes';
import {
  GithubOrganizationTeamStructure,
  GithubTeam,
} from '@vigilant-broccoli/common-js';
import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const API_ROUTES = {
  GET_CONFIGURATIONS: '/api/get-configurations',
  GET_FILE_OBJECT: '/api/get-file-object',
};

const EVENTS = [
  { title: 'event 1', date: new Date().toISOString().split('T')[0] },
  { title: 'event 2', date: new Date().toISOString().split('T')[0]  },
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

  async function addCalendarEvent(){
    setEvents(prev=>[...prev, { title: 'New Event', date: new Date().toISOString().split('T')[0] }]);
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
    <div>
      {files.map(file => (
        <Card key="file" onClick={() => test(file)}>
          {file}
        </Card>
      ))}
      <TextArea
        value={jsonConfig}
        onChange={e => setJsonConfig(e.target.value)}
      />
      {teamNames.map(name => (
        <div key={name}>
          <Link href={name} target="blank">
            {name}
          </Link>
        </div>
      ))}
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
      />
      <Button onClick={addCalendarEvent}>Add Calendar Event</Button>
    </div>
  );
}
