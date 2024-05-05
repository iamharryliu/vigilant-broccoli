# React

## Render

```
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<>Your HTML</>);
```

## Event Handling

```
<button onClick={handleButtonClick}>On Click</button>
```

## Conditionals

```
{condition} && <div>Block</div>
{condition} ? <div>Block</div> : <div>Else Block</div>
```

## Lists

```
{list.map((car) => <div key={car.id}>Content</div>)}
```

## Components

### Functional Components

```
function Component() {
  return <>Your HTML</>;
}

export default Component;
```

```
root.render(<Component />);
```

#### Props

```
function Component(props) {
  return <>{props.value}</>;
}
root.render(<Component value="value"/>);
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
      <Link to="/">Home</Link>
      <Link to="/something">Something</Link>
      <Link to="/something-else">Something Else</Link>
      <Outlet />
    </>
  )
};
```

## Hooks

### useState

```
const [state, setState] = useState(data);
```

### setState

```
setState(previousState => {
  return { ...previousState, { stateChanges... } }
});
```

### useEffect

```
useEffect(() => {
// Runs on every render
});

useEffect(() => {
// Runs only on the first render
}, []);

useEffect(() => {
// Runs on the first render
// And any time any dependency value changes
}, [prop, state]);
```

### createContext

```
import { useState, createContext } from "react";
import ReactDOM from "react-dom/client";
const Context = createContext()
```

```
function Component() {
  const [state, setState] = useState(data);

  return (
    <Context.Provider value={user}>
      <ChildComponent />
    </Context.Provider>
  );
}
```

```
function NestedComponent() {
  const data = useContext(Context);
  return (
    <>{data}</>
  );
}
```

### useRef

useRef is used to persist values between renders and prevent infinite re-renders.

```
const count = useRef(0);
useEffect(() => {
    count.current = count.current + 1;
});
```

DOM Manipulation.

```
const inputElement = useRef();

const focusInput = () => {
  inputElement.current.focus();
};

<button onClick={focusInput}>Focus Input</button>
```

Tracking input changes.

```
const [inputValue, setValue] = useState("");
const previousValue = useRef("");

useEffect(() => {
  previousValue.current = inputValue;
}, [inputValue]);

<input
  type="text"
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
/>
```

## useCallback

```
// Will ALWAYS get hit on re-render.
const fn = () => {
  setState((value) => [...value, newData]);
};

// Will only re-render when props have changed
const fn = useCallback(() => {
  setState((value) => {...stateValue, newData});
}, [props]);
```

## useMemo

```
const value = expensiveCalculation(state);
// vs
const value = useMemo(() => expensiveCalculation(state), [state]);
```

## References

[W3 React Tutorial](https://www.w3schools.com/REACT/)
