import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/js/src/collapse.js';
import { Collapse } from 'bootstrap';

const COLLAPSABLE_NAVBAR_CONTENT_ID = 'navbarSupportedContent';

export default function NavbarComponent() {
  function collapse() {
    const navbarCollapse = document.getElementById(
      COLLAPSABLE_NAVBAR_CONTENT_ID,
    );
    if (navbarCollapse) {
      const collapse = new Collapse(navbarCollapse);
      collapse.hide();
    }
  }

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          React Demo
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse"
          id={COLLAPSABLE_NAVBAR_CONTENT_ID}
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/hooks" onClick={collapse}>
                Hooks
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/todo" onClick={collapse}>
                Todo
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
