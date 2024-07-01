# Basics

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
function Component() {
return <>Your HTML</>;
}

export default Component;
```

```
root.render(<Component />);
```

#### Props

##### Passing Props

```
<Component value="value"/>
const Component = (props) => {
    return <>{{ props.value }}</>
}

// With Destructuring
<Component {...props}>
const Component = ({ value, ...}) => {
    return <>{{ value }}</>
}
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
                <Route path="\*" element={<NoPage />} />
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
