import { createContext, useContext } from 'react';

// Null outside the projects routes (status, deployments, career and games
// hosts), which mount no search dialog.
export const SearchContext = createContext<(() => void) | null>(null);

export const useOpenSearch = () => useContext(SearchContext);
