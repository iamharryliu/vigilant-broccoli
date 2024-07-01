import React from 'react';
import { Link } from 'react-router-dom';

const HooksPage = () => {
  return (
    <>
      <h2>Hooks Page</h2>
      <div className="list-group">
        <Link
          className="list-group-item list-group-item-action"
          to="/hooks/useState"
        >
          useState Demo
        </Link>
        <Link
          className="list-group-item list-group-item-action"
          to="/hooks/useEffect"
        >
          useEffect Demo
        </Link>
        <Link
          className="list-group-item list-group-item-action"
          to="/hooks/useReducer"
        >
          useReducer Demo
        </Link>
        <Link
          className="list-group-item list-group-item-action"
          to="/hooks/useRef"
        >
          useRef Demo
        </Link>
      </div>
    </>
  );
};

export default HooksPage;
