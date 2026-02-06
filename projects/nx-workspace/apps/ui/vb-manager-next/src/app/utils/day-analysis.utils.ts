interface RawTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
  updated?: string;
}

interface CleanTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'none';
  category: string;
  hasDeadline: boolean;
  isOverdue: boolean;
  daysOverdue?: number;
}

interface CategorizedTasks {
  urgent: CleanTask[];
  important: CleanTask[];
  delegate: CleanTask[];
  eliminate: CleanTask[];
  overdue: CleanTask[];
}

const QUADRANT_REGEX = /^(Q[1-4])[\s:]/i;
const CATEGORY_REGEX = /^(?:Q[1-4][\s:]+)?([a-z&]+):/i;

const getQuadrant = (title: string): 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'none' => {
  const match = title.match(QUADRANT_REGEX);
  if (match) {
    return match[1].toUpperCase() as 'Q1' | 'Q2' | 'Q3' | 'Q4';
  }
  return 'none';
};

const getCategory = (title: string): string => {
  const match = title.match(CATEGORY_REGEX);
  if (match) {
    return match[1].toLowerCase();
  }
  return 'other';
};

const isOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

const getDaysOverdue = (dueDate?: string): number | undefined => {
  if (!dueDate || !isOverdue(dueDate)) return undefined;
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = Math.abs(now.getTime() - due.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const cleanTask = (task: RawTask): CleanTask => {
  const quadrant = getQuadrant(task.title);
  return {
    id: task.id,
    title: task.title,
    notes: task.notes,
    due: task.due,
    status: task.status,
    quadrant,
    category: getCategory(task.title),
    hasDeadline: !!task.due,
    isOverdue: isOverdue(task.due),
    daysOverdue: getDaysOverdue(task.due),
  };
};

export const categorizeTasksByQuadrant = (rawTasks: RawTask[]): CategorizedTasks => {
  const cleanedTasks = rawTasks.map(cleanTask);

  const categorized: CategorizedTasks = {
    urgent: [],
    important: [],
    delegate: [],
    eliminate: [],
    overdue: [],
  };

  cleanedTasks.forEach(task => {
    if (task.isOverdue && task.status === 'needsAction') {
      categorized.overdue.push(task);
    }

    switch (task.quadrant) {
      case 'Q1':
        categorized.urgent.push(task);
        break;
      case 'Q2':
        categorized.important.push(task);
        break;
      case 'Q3':
        categorized.delegate.push(task);
        break;
      case 'Q4':
        categorized.eliminate.push(task);
        break;
    }
  });

  return categorized;
};

interface RawCalendarEvent {
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
    organizer?: boolean;
    self?: boolean;
    optional?: boolean;
  }>;
  hangoutLink?: string;
  status?: string;
}

interface CleanCalendarEvent {
  summary: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  meetingLink?: string;
  attendees?: string[];
  isAllDay: boolean;
}

export const cleanCalendarEvent = (event: RawCalendarEvent): CleanCalendarEvent => {
  const isAllDay = !event.start?.dateTime;

  const attendeesList = event.attendees
    ?.filter(a => !a.self)
    .map(a => a.displayName || a.email.split('@')[0]);

  return {
    summary: event.summary || 'Untitled Event',
    startTime: event.start?.dateTime || event.start?.date || '',
    endTime: event.end?.dateTime || event.end?.date || '',
    location: event.location,
    description: event.description,
    meetingLink: event.hangoutLink,
    attendees: attendeesList,
    isAllDay,
  };
};

export const cleanCalendarEvents = (events: RawCalendarEvent[]): CleanCalendarEvent[] => {
  return events.map(cleanCalendarEvent);
};
