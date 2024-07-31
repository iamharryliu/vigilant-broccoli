# React Hooks

## useState

```
const [state, setState] = useState(INITIAL_STATE);

setState(previousState => {
    return { ...previousState, stateChanges... };
});
```

## useReducer

```
const reducer = (state: StateType, action: ActionType): StateType => {
    switch (action.type) {
        case ACTION_TYPE:
            return updateState(action.payload)
        default:
            return state;
    }
};

const Component() = () => {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
    dispatch({ type: "ACTION_TYPE", payload: data });
};
```

## createContext

```
const ItemsContext = createContext<Type>({
    k1: v1,
    ...
    fn1: () => {},
    ...
})
export const useItems = useContext(ItemsContext)

```

```
const Component() => {
    const [state, setState] = useState(data);

    return (
        <ItemsContext.Provider value={state, dispatchFunction...}>
            {children}
        </ItemsContext.Provider>
    );
}
```

```
const NestedComponent = () => {
const data = useContext(Context);
    return (
        <>{data}</>
    );
}
```

## useEffect

```
useEffect(() => {
    // Runs on every render
});

useEffect(() => {
// Runs only on the first render
    ...code to run on first render
    return () => cleanupCode()
}, []);

useEffect(() => {
    // Runs any time any dependency values change
}, [state, ...]);
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