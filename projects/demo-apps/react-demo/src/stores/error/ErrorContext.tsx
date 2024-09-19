import { createContext, useState } from 'react';

export type ErrorContextType = {
  errorMessage: string;
  setError: (message: string) => void;
  clearError: () => void;
};

export const ErrorContext = createContext<ErrorContextType>({
  errorMessage: '',
  setError: () => {
    throw new Error('createTodo function not initialized');
  },
  clearError: () => {
    throw new Error('createTodo function not initialized');
  },
});

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errorMessage, setError] = useState('');

  const clearError = () => {
    setError('');
  };

  return (
    <ErrorContext.Provider value={{ errorMessage, setError, clearError }}>
      {errorMessage ? 'nej' : children}
    </ErrorContext.Provider>
  );
};
