import { useEffect, useState } from 'react';

export function ReturnTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 100);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-5 left-1/2 transform -translate-x-1/2 text-white rounded-full w-12 h-12 bg-gray-500 bg-opacity-20 hover:bg-opacity-100"
    >
      ^
    </button>
  );
}
