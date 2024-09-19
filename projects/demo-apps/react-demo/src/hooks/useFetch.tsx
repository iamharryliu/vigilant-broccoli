import { Todo } from '@prettydamntired/todo-lib';
import { useState, useEffect } from 'react';
import { useErrorContext } from './useError';

const useFetch = (url: string): Todo[] => {
  const { setError } = useErrorContext();
  const [data, setData] = useState<Todo[]>([]);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setData(data.slice(0, 10)))
      .catch(error => setError(error.message));
  }, [url]);

  return data;
};

export default useFetch;
