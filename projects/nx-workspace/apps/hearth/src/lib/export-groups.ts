type ExportTable = {
  name: string;
  table: string;
  select?: string;
};

type ExportGroup = {
  key: string;
  label: string;
  tables: ExportTable[];
};

// Binary files (receipt images, doc files) stay in R2; only their metadata rows
// are exported. Where Is and Kitchen Planner have their own exports.
export const HOME_DATA_EXPORT_GROUPS: ExportGroup[] = [
  {
    key: 'calendar-events',
    label: 'Calendar Events',
    tables: [{ name: 'calendarEvents', table: 'calendar_events' }],
  },
  {
    key: 'docs',
    label: 'Documents',
    tables: [
      {
        name: 'docs',
        table: 'home_docs',
        select: '*, home_doc_files(*)',
      },
    ],
  },
  {
    key: 'home-members',
    label: 'Home Members',
    tables: [{ name: 'homeMembers', table: 'home_members' }],
  },
  {
    key: 'household-rules',
    label: 'Household Rules',
    tables: [{ name: 'householdRules', table: 'household_rules' }],
  },
  {
    key: 'leisure-activities',
    label: 'Leisure Activities',
    tables: [{ name: 'leisureActivities', table: 'leisure_activities' }],
  },
  {
    key: 'meals',
    label: 'Meals and Recipes',
    tables: [
      { name: 'meals', table: 'meals' },
      { name: 'recipes', table: 'recipes' },
    ],
  },
  {
    key: 'price-tracker',
    label: 'Price Tracker',
    tables: [
      {
        name: 'priceItems',
        table: 'price_items',
        select: '*, price_entries(*)',
      },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    tables: [
      { name: 'projects', table: 'home_projects' },
      { name: 'kitchenProjects', table: 'kitchen_project_items' },
    ],
  },
  {
    key: 'receipts',
    label: 'Receipts',
    tables: [
      { name: 'merchants', table: 'receipt_merchants' },
      {
        name: 'receipts',
        table: 'receipts',
        select: '*, receipt_items(*), receipt_taxes(*), receipt_images(*)',
      },
    ],
  },
  {
    key: 'resources',
    label: 'Resources and Bookings',
    tables: [
      { name: 'resources', table: 'resources' },
      { name: 'bookings', table: 'resource_bookings' },
    ],
  },
  {
    key: 'tasks',
    label: 'Tasks',
    tables: [
      { name: 'recurringTasks', table: 'home_recurring_tasks' },
      {
        name: 'recurringTaskCompletions',
        table: 'home_recurring_task_completions',
      },
      { name: 'oneOffTasks', table: 'home_one_off_tasks' },
    ],
  },
  {
    key: 'whiteboards',
    label: 'Whiteboards',
    tables: [
      {
        name: 'whiteboards',
        table: 'whiteboards',
        // yjs_state is sync bookkeeping that can be rebuilt from content.
        select: 'id, home_id, board_key, content, updated_at',
      },
      { name: 'history', table: 'whiteboard_history' },
    ],
  },
];
