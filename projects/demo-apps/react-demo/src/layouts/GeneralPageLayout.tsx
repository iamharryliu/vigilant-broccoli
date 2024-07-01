import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarComponent from '../components/NavbarComponent';

const Layout = () => {
  return (
    <>
      <NavbarComponent></NavbarComponent>
      <Outlet />
    </>
  );
};

export default Layout;
