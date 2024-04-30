# React

## Render

```
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<p>Hello World</p>);
```

## Components

### Functional Components

```
function Component() {
  return <h2>I am a component</h2>;
}

export default Car;
```

```
root.render(<Component />);
```

#### Props

```
function Component(props) {
  return <h2>Received {props.value}</h2>;
}
root.render(<Car value="value"/>);
```

## Routing

```
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="something" element={<Something />} />
          <Route path="something-else" element={<SomethingElse />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

```
const Layout = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/something">Something</Link>
          </li>
          <li>
            <Link to="/something-else">Something Else</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  )
};
```
