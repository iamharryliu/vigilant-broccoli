import { Route, Link } from 'react-router-dom';

export function VigilantBroccoliNextLib() {
  return (
    <div className={styles['container']}>
      <h1>Welcome to VigilantBroccoliNextLib!</h1>
      <ul>
        <li>
          <Link to="/">@vigilant-broccoli/next-lib root</Link>
        </li>
      </ul>
      <Route
        path="/"
        element={<div>This is the @vigilant-broccoli/next-lib root route.</div>}
      />
    </div>
  );
}

export default VigilantBroccoliNextLib;
