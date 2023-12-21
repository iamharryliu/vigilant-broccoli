import React, { useState, useEffect } from 'react';

const StatusPage = () => {
  const [loginStatus, setLoginStatus] = useState('loading');

  useEffect(() => {
    const fetchLoginStatus = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/users/get_login_status',
          {
            credentials: 'include',
          },
        );

        if (response.ok) {
          const data = await response.json();
          setLoginStatus(data.status);
        } else {
          console.error('Failed to fetch login status');
        }
      } catch (error) {
        console.error('Error occurred:', error);
      }
    };

    fetchLoginStatus();
  }, []);

  return (
    <div>
      <h1>Login Status</h1>
      <div>Login status: {String(loginStatus)}</div>
    </div>
  );
};

export default StatusPage;
