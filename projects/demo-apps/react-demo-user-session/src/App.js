import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import IndexPage from './IndexPage';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';
import StatusPage from './StatusPage';
import LogoutButton from './LogoutButton';
const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Index</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/login_status">Login Status</Link>
            </li>
          </ul>
          <LogoutButton />
        </nav>

        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login_status" element={<StatusPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
