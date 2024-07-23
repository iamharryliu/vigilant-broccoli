import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [identification, setIdentification] = useState('');
  const [password, setPassword] = useState('');

  const handleIdentificationChange = (e: React.FormEvent<HTMLInputElement>) => {
    setIdentification(e.currentTarget.value);
  };

  const handlePasswordChange = (e: React.FormEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = {
      identification,
      password,
    };

    try {
      const response = await fetch('http://localhost:5000/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log('Authentication successful');
        navigate('/');
      } else {
        // Authentication failed
        console.error('Authentication failed');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Identification:
            <input
              type="text"
              value={identification}
              onChange={handleIdentificationChange}
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </label>
        </div>
        <div>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
