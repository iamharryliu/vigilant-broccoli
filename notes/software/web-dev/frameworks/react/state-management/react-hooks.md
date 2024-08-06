# React Hooks

- Hooks - Provider > Context > Reducer > Data and Dispatch Functions

## useEffect

```
// Runs on every render
useEffect(() => {
    ...
});

// Runs only on the first render
useEffect(() => {
    ...
    return () => cleanupCode()
}, []);

// Runs any time any dependency values change
useEffect(() => {
    ...
}, [...values_to_watch]);
```

## useState

```
const [state, setState] = useState(INITIAL_STATE);

setState(previousState => {
    return { ...previousState, stateChanges... };
});
```

## useContext

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
