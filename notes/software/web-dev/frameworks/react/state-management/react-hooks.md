# React Hooks

- Hooks - Provider > Context > Reducer > Data and Dispatch Functions

## useEffect

```
// Runs on every render
useEffect(() => {
    ...sideEffects
    return () => cleanupCode()
});

// Runs only on the first render
useEffect(() => {
    ...sideEffects
    return () => cleanupCode()
}, []);

// Runs any time any dependency values change
useEffect(() => {
    ...sideEffects
    return () => cleanupCode()
}, [...dependencies]);
```

- [Custom Hooks for Objects(Deep Comparison)](https://stackoverflow.com/questions/54095994/react-useeffect-comparing-objects)

## useState

```
const [state, setState] = useState(INITIAL_STATE);

setState(previousState => {
    return { ...previousState, stateChanges... };
});
```

## useContext

Use context without provider will not rerender in context change, provider gives access to state changes.

```
type Context{
	...
}

const context = createContext<Context>({
    ...data,
    ...functions
})

useSomething = useContext(context)

const WrapperComponent() => {
	...
    return (
        <Context.Provider value={...data, ...functions}>
            {children}
        </Context.Provider>
    );
}

const ChildComponent() => {
	const { ...data, ...functions } = useSomething();
}
```

## useReducer

```

const reducer = (state: StateType, action: ActionType): StateType => {
    const { type, payload } = action;
    switch (type) {
        case ACTION_TYPE:
            ...
        default:
            return state;
    }
};

const Component() = () => {
    const [data, dispatch] = useReducer(reducer, INITIAL_STATE);
    dispatch({ type: "ACTION_TYPE", payload: data });
};

```

## useRef

useRef is used to persist values between renders and prevent infinite re-renders.
Use case scenarios:

- Accessing DOM Elements Directly
- Storing Mutable Values and Avoiding Re-render Loops
- Keeping Track of Previous Values
- Persisting Data Across Renders such as keeping track of loading on form submit
- Referencing child components

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

Prevents re-creation of functions on every render, which is useful when passing functions as props to child components. It helps avoid unnecessary re-renders in child components that rely on reference equality of props.

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

Prevents re-execution of expensive calculations, such as filtering a large array or performing complex computations.

```
const value = expensiveCalculation(state);
// vs
const value = useMemo(() => expensiveCalculation(state), [state]);
```
