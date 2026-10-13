import { useState } from 'react';
import { CollapsibleList } from '@vigilant-broccoli/react-lib';
import { UTILITY_ITEMS } from './utilities.const';

const STORAGE_KEY_PREFIX = 'utilities';
const SEARCH_PLACEHOLDER = 'Search utilities...';
const NO_RESULTS_TEXT = 'No utilities match your search.';

export const App = () => {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = UTILITY_ITEMS.filter(item =>
    item.title?.toLowerCase().includes(normalizedQuery),
  );

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Utilities</h1>
      <input
        type="search"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder={SEARCH_PLACEHOLDER}
        aria-label={SEARCH_PLACEHOLDER}
        autoFocus
        className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
      {filteredItems.length ? (
        <CollapsibleList
          items={filteredItems}
          storageKeyPrefix={STORAGE_KEY_PREFIX}
        />
      ) : (
        <p className="text-sm text-gray-500">{NO_RESULTS_TEXT}</p>
      )}
    </main>
  );
};

export default App;
