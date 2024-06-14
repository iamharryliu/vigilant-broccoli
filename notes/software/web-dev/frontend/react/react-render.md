# React Render

- React checks for state value changes top down from the root of the app component to the child components.
- React flags components for re-rendering when their state or props change.
- React will not re-render a component if:
  - Initial state changed to the same value.
  - State changed and after being changed again to the same value, will start bailing on subsequent renders.
- Re-render flow: Render Phase -> Commit Phase -> DOM
  - Render Phase - React calculates what changes need to be made to the virtual DOM. This is a pure computation phase where React creates a new virtual DOM tree to compare with the previous one.
  - Commit Phase: React applies the necessary changes to the real DOM. This phase includes:
    - Applying changes to the DOM.
    - Invoking lifecycle methods like componentDidMount and componentDidUpdate.
    - Running any effects scheduled with useEffect.

## Render Phase

```
const container = document.getElementById('rootId');
const root = ReactDOM.createRoot(container);
root.render(<>HTML Content </>);
```

### Re-render

- A component can re-render if:
  - A component calls a setter function or a dispatch function.
  - If parent components are re-rendered.
- Happens on state value _changes_ if the value of a variable is reassigned. Re-render will not happen for object values that are modified.

```
// No re-render for modified list.
list.push(value)
setValue(list)
// Re-renders for modified list.
const newList = [...list]
newList.push(value)
set(newList)

// No re-render for modified object.
dict.key = value
// Re-renders for modified object.
const newDict = {...dict}
newDict.key = value
set(newDict)
```

### Render Optimization

#### Same Element Reference

Unoptimized Solution Without Same Element Reference

```
export const AppComponent = () => {
  ...
  return (
    <>
      <ParentComponent/>
    <>
  )
}

export const ParentComponent = () => {
  ...
  return (
    <>
      <ChildComponent/> // Child component declared inside of ParentComponent
    <>
  )
}
```

vs. Optimized Solution With Same Element Reference

```

export const AppComponent = () => {
  ...
  return (
    <>
      <ParentComponent>
        <ChildComponent/> // Child component passed as a prop to ParentComponent
      </ParentComponent>
    <>
  )
}

export const ParentComponent = ({ children }) =>{
  ...
  return (
    <>
      { children }
    <>
  )
}
```

#### React Memo

Unoptimized Solution Without React Memo

```
export const ChildComponent = () => {
  ...
  return (
    <>
      <ChildComponent/>
    <>
  )
}

export const ParentComponent = () => {
  ...
  return (
    <>
      <ChildComponent state="state"/>
    <>
  )
}

```

Optimized Solution With React Memo

```
export const ChildComponent = () => {
  ...
  return (
    <>
      <ChildComponent/>
    <>
  )
}
export const MemoizedChildComponent = React.memo(ChildComponent)

export const ParentComponent = () => {
  ...
  return (
    <>
      <MemoizedChildComponent state="state"/>
    <>
  )
}
```
