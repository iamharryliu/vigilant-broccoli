import React from 'react';
import { Link } from 'react-router-dom';

const HooksPage = () => {
  return (
    <>
      <h2>Hooks Page</h2>
      <Link className="nav-link" to="/hooks/useState">
        useState Demo
      </Link>
      <Link className="nav-link" to="/hooks/useEffect">
        useEffect Demo
      </Link>
      <Link className="nav-link" to="/hooks/useReducer">
        useReducer Demo
      </Link>
      <Link className="nav-link" to="/hooks/useRef">
        useRef Demo
      </Link>
    </>
  );
};

export default HooksPage;
