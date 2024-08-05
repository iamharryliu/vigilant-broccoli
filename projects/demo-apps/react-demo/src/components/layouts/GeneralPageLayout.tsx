import { Outlet } from 'react-router-dom';
import NavbarComponent from '../general-components/NavbarComponent';
import Main from './MainComponent';

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
