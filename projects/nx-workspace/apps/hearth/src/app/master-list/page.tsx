'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, Text } from '@radix-ui/themes';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import {
  CalendarEvent,
  LeisureActivity,
  Meal,
  HomeProject,
  HouseholdRule,
  Resource,
  ResourceBooking,
} from '../../lib/types';
import { ROUTES } from '../../lib/routes';
import { LeisureList } from '../leisure/components/LeisureList';
import { LeisureActivityFormData } from '../leisure/components/LeisureActivityForm';
import { MealList } from '../meals/components/MealList';
import { MealFormData } from '../meals/components/MealForm';
import { HomeProjectList } from '../projects/components/HomeProjectList';
import { HomeProjectFormData } from '../projects/components/HomeProjectForm';
import { ResourceList } from '../resources/components/ResourceList';
import { ResourceFormData } from '../resources/components/ResourceForm';
import { HouseholdRuleList } from '../household-rules/components/HouseholdRuleList';

export default function MasterListPage() {
  const router = useRouter();
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [activities, setActivities] = useState<LeisureActivity[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [projects, setProjects] = useState<HomeProject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<ResourceBooking[]>([]);
  const [rules, setRules] = useState<HouseholdRule[]>([]);

  const token = session?.access_token ?? '';
  const auth = (extra?: Record<string, string>) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  const fetchAll = useCallback(async () => {
    if (!homeId || !token) return;
    const [
      eventsRes,
      activitiesRes,
      mealsRes,
      projectsRes,
      resourcesRes,
      bookingsRes,
      rulesRes,
    ] = await Promise.all([
      fetch(`/api/calendar/events?homeId=${homeId}`, { headers: auth() }),
      fetch(`/api/leisure?homeId=${homeId}`, { headers: auth() }),
      fetch(`/api/meals?homeId=${homeId}`, { headers: auth() }),
      fetch(`/api/projects?homeId=${homeId}`, { headers: auth() }),
      fetch(`/api/resources?homeId=${homeId}`, { headers: auth() }),
      fetch(`/api/resources/bookings?homeId=${homeId}`, { headers: auth() }),
      fetch(`/api/household-rules?homeId=${homeId}`, { headers: auth() }),
    ]);
    const [events, acts, ms, ps, rs, bs, rl] = await Promise.all([
      eventsRes.json(),
      activitiesRes.json(),
      mealsRes.json(),
      projectsRes.json(),
      resourcesRes.json(),
      bookingsRes.json(),
      rulesRes.json(),
    ]);
    setCalendarEvents(Array.isArray(events) ? events : []);
    setActivities(Array.isArray(acts) ? acts : []);
    setMeals(Array.isArray(ms) ? ms : []);
    setProjects(Array.isArray(ps) ? ps : []);
    setResources(Array.isArray(rs) ? rs : []);
    setBookings(Array.isArray(bs) ? bs : []);
    setRules(Array.isArray(rl) ? rl : []);
  }, [homeId, token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleLeisureAdd = async (data: LeisureActivityFormData) => {
    await fetch('/api/leisure', {
      method: 'POST',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    fetchAll();
  };
  const handleLeisureEdit = async (
    id: string,
    data: LeisureActivityFormData,
  ) => {
    await fetch('/api/leisure', {
      method: 'PATCH',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, ...data }),
    });
    fetchAll();
  };
  const handleLeisureDelete = async (id: string) => {
    await fetch('/api/leisure', {
      method: 'DELETE',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
    fetchAll();
  };

  const handleMealAdd = async (data: MealFormData) => {
    await fetch('/api/meals', {
      method: 'POST',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    fetchAll();
  };
  const handleMealEdit = async (id: string, data: MealFormData) => {
    await fetch('/api/meals', {
      method: 'PATCH',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, ...data }),
    });
    fetchAll();
  };
  const handleMealDelete = async (id: string) => {
    await fetch('/api/meals', {
      method: 'DELETE',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
    fetchAll();
  };

  const handleProjectAdd = async (data: HomeProjectFormData) => {
    await fetch('/api/projects', {
      method: 'POST',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    fetchAll();
  };
  const handleProjectEdit = async (id: string, data: HomeProjectFormData) => {
    await fetch('/api/projects', {
      method: 'PATCH',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, ...data }),
    });
    fetchAll();
  };
  const handleProjectDelete = async (id: string) => {
    await fetch('/api/projects', {
      method: 'DELETE',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
    fetchAll();
  };

  const handleResourceAdd = async (data: ResourceFormData) => {
    await fetch('/api/resources', {
      method: 'POST',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    fetchAll();
  };
  const handleResourceEdit = async (id: string, data: ResourceFormData) => {
    await fetch('/api/resources', {
      method: 'PATCH',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, ...data }),
    });
    fetchAll();
  };
  const handleResourceDelete = async (id: string) => {
    await fetch('/api/resources', {
      method: 'DELETE',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
    fetchAll();
  };

  const handleRuleCreate = async (
    form: HouseholdRule,
  ): Promise<HouseholdRule> => {
    const res = await fetch('/api/household-rules', {
      method: 'POST',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...form, homeId }),
    });
    return res.json();
  };
  const handleRuleUpdate = async (form: HouseholdRule): Promise<void> => {
    await fetch('/api/household-rules', {
      method: 'PATCH',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: form.id,
        name: form.name,
        description: form.description,
        position: form.position,
      }),
    });
  };
  const handleRuleDelete = async (id: string | number): Promise<void> => {
    await fetch('/api/household-rules', {
      method: 'DELETE',
      headers: auth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Text size="6" weight="bold">
        Master List
      </Text>

      <Tabs.Root defaultValue="leisure">
        <Tabs.List>
          <Tabs.Trigger value="leisure">Leisure</Tabs.Trigger>
          <Tabs.Trigger value="meals">Meals</Tabs.Trigger>
          <Tabs.Trigger value="projects">Projects</Tabs.Trigger>
          <Tabs.Trigger value="resources">Resources</Tabs.Trigger>
          <Tabs.Trigger value="rules">Household Rules</Tabs.Trigger>
        </Tabs.List>

        <div className="pt-4">
          <Tabs.Content value="leisure">
            <LeisureList
              activities={activities}
              calendarEvents={calendarEvents}
              onAdd={handleLeisureAdd}
              onEdit={handleLeisureEdit}
              onDelete={handleLeisureDelete}
              hideDragHint
              onItemClick={a => router.push(ROUTES.LEISURE_DETAIL(a.id))}
            />
          </Tabs.Content>

          <Tabs.Content value="meals">
            <MealList
              meals={meals}
              calendarEvents={calendarEvents}
              onAdd={handleMealAdd}
              onEdit={handleMealEdit}
              onDelete={handleMealDelete}
              hideDragHint
              onItemClick={m => router.push(ROUTES.MEALS_DETAIL(m.id))}
            />
          </Tabs.Content>

          <Tabs.Content value="projects">
            <HomeProjectList
              projects={projects}
              calendarEvents={calendarEvents}
              onAdd={handleProjectAdd}
              onEdit={handleProjectEdit}
              onDelete={handleProjectDelete}
              hideDragHint
              onItemClick={p => router.push(ROUTES.PROJECTS_DETAIL(p.id))}
            />
          </Tabs.Content>

          <Tabs.Content value="resources">
            <ResourceList
              resources={resources}
              bookings={bookings}
              onAdd={handleResourceAdd}
              onEdit={handleResourceEdit}
              onDelete={handleResourceDelete}
              hideDragHint
              onItemClick={r => router.push(ROUTES.RESOURCES_DETAIL(r.id))}
            />
          </Tabs.Content>

          <Tabs.Content value="rules">
            {homeId && (
              <HouseholdRuleList
                rules={rules}
                setRules={setRules}
                homeId={homeId}
                onCreate={handleRuleCreate}
                onUpdate={handleRuleUpdate}
                onDelete={handleRuleDelete}
              />
            )}
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
