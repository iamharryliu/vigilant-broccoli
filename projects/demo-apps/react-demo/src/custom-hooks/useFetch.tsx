import { useState, useEffect } from 'react';
import { Todo } from '../pages/todo/TodoContext';

const useFetch = (url: string): Todo[] => {
  const [data, setData] = useState<Todo[]>([]);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setData(data.slice(0, 10)));
  }, [url]);

  return data;
};

export default useFetch;
