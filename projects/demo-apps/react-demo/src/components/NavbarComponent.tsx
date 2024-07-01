import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/js/src/collapse.js';
import { Collapse } from 'bootstrap';

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
}

const COLLAPSABLE_NAVBAR_CONTENT = {
  ID: 'navbarSupportedContent',
  LINKS: ['hooks', 'todo'],
};

export default function NavbarComponent() {
  const [isCollapse, setIsCollapse] = useState(true);

  function collapse() {
    const navbarCollapse = document.getElementById(
      COLLAPSABLE_NAVBAR_CONTENT.ID,
    );
    if (navbarCollapse && !isCollapse) {
      const collapse = new Collapse(navbarCollapse);
      collapse.hide();
    }
  }

  function toggle() {
    const navbarCollapse = document.getElementById(
      COLLAPSABLE_NAVBAR_CONTENT.ID,
    );
    if (navbarCollapse) {
      const collapse = new Collapse(navbarCollapse);
      collapse.toggle();
    }
  }

  useEffect(() => {
    const navbarCollapse = document.getElementById(
      COLLAPSABLE_NAVBAR_CONTENT.ID,
    );

    if (navbarCollapse) {
      const handleShown = () => {
        setIsCollapse(false);
      };

      const handleHidden = () => {
        setIsCollapse(true);
      };

      navbarCollapse.addEventListener('shown.bs.collapse', handleShown);
      navbarCollapse.addEventListener('hidden.bs.collapse', handleHidden);

      // Cleanup event listeners on component unmount
      return () => {
        navbarCollapse.removeEventListener('shown.bs.collapse', handleShown);
        navbarCollapse.removeEventListener('hidden.bs.collapse', handleHidden);
      };
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          React Demo
        </Link>
        <button className="navbar-toggler" type="button" onClick={toggle}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse"
          id={COLLAPSABLE_NAVBAR_CONTENT.ID}
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {COLLAPSABLE_NAVBAR_CONTENT.LINKS.map(link => {
              return (
                <li className="nav-item" key={link}>
                  <Link className="nav-link" to={link} onClick={collapse}>
                    {toTitleCase(link)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
