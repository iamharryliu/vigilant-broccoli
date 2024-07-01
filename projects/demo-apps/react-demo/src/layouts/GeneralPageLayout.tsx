import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarComponent from '../components/NavbarComponent';
import Main from '../components/MainComponent';

const Layout = () => {
  return (
    <>
      <NavbarComponent></NavbarComponent>
      <Main>
        <Outlet />
      </Main>
    </>
  );
};

export default Layout;
