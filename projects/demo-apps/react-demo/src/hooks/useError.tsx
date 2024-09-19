import { useContext } from 'react';
import { ErrorContext } from '../stores/error/ErrorContext';

export const useErrorContext = () => {
  return useContext(ErrorContext);
};
