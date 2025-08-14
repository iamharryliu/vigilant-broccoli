# Basics

## Getting Started

- Create react project using [Vite].
- [Folder Structures in React Projects](https://dev.to/itswillt/folder-structures-in-react-projects-3dp8)

## How React Works

```
_index.html_ > _main.tsx_ > _App.tsx_
```

```
// index.html
<div id="root"></div>
```

```
// main.tsx
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

```
// App.tsx
export default function App() {
  return (
    <>
      ...
    </>
  );
}
```

## State Management

- Prop drilling from ancestor components.
- Context API.
- Custom hooks.
- State management libraries.

## Event Handling

```
<button onClick={handleButtonClick}>On Click</button>
```

### Rendering

#### Conditional Rendering

```
{ condition && <div>Block</div> }
{ condition ? <div>Block</div> : <div>Else Block</div> }
```

#### List Rendering

- Keys are used in list rendering to reduce unnecessary re-rendering.
- Index as key anti-pattern
  - Use index as key when:
    - Items do not have unique ID
    - The list is a static list and will not change.
    - The list will never be reordered or filtered.
  - Preferably use some sort of hashed value for the key.

```
{ list.map((item, index) => <div key={index}>{item.key})</div> }
```

## Components

### Functional Components

```
export default function Component() {
	return <>Your HTML</>;
}
```

```
root.render(<Component />);
```

### Props

#### Props Values

```
<Component value={value}/>

const Component = (props) => {
	return <>{{ props.value }}</>
}
```

#### Destructuring Props Values

```
<Component {...data}/>

const Component = ({ value1, value2, ...}) => {
  return ...
}
```

#### Children Props

```
<Component>
	<ChildrenData/>
</Component>

const Component = (props) => {
    return <>{ props.children }</>
}
```

## Routing

```
npm install react-router-dom
```

```
<BrowserRouter>
  <nav>
    <Link to="/">Home</Link>
    <Link to="/something">Something</Link>
    <Link to="/something-else">Something Else</Link>
    <Outlet />
  </nav>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<IndexPage />} />
      <Route path="page1" element={<Page1 />} />
      <Route path="page2" element={<Page2 />} />
      <Route path="\*" element={<NoPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Route Parameters

```
const UserProfile = () => {
  const { username } = useParams();
  return <h2>User Profile for {username}</h2>;
};

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/user/johndoe">John Doe</Link>
        <Link to="/user/janedoe">Jane Doe</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h2>Home Page</h2>} />
        <Route path="/user/:username" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}
```

### Nested Routing

```
const Dashboard = () => (
  <div>
    <h2>Dashboard</h2>
    <nav>
      <Link to="stats">Stats</Link>
      <Link to="settings">Settings</Link>
    </nav>
    <Outlet />
  </div>
);

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h2>Home Page</h2>} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
```

### Protected Routes

```
const ProtectedRoute = ({ element: Component, ...rest }) => {
  return isAuthenticated() ? <Component {...rest} /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h2>Home Page</h2>} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
      </Routes>
    </Router>
  );
}
```
