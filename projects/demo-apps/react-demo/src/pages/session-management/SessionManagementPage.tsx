import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const SessionManagementPage = () => {
  return (
    <>
      <h2>Session Management Page</h2>
      <nav>
        <ul>
          <li>
            <Link to="/session/register">Register</Link>
          </li>
          <li>
            <Link to="/session/login">Login</Link>
          </li>
          <li>
            <Link to="/session/login_status">Login Status</Link>
          </li>
        </ul>
        <LogoutButton />
      </nav>
    </>
  );
};

export default SessionManagementPage;
