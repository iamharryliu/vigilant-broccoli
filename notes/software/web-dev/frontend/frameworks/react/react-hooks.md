# React Hooks

- Hooks - Provider > Context > Reducer > Data and Dispatch Functions

## useState

Manages local state within a component, triggers re-renders when updated.

```
const [state, setState] = useState(INITIAL_STATE);
setState(_previousState => {
    return newState;
});
```

## useEffect

Runs side effects like data fetching, DOM updates, or subscriptions after render

```
  useEffect(() => {
    console.log('This runs on every render.');
  });
  useEffect(() => {
    console.log('This runs when the component is initalized.');
  }, []);
  useEffect(() => {
    console.log('This runs when there is a change to the values in the dependency array, in this case state.');
  }, [state]);
  useEffect(() => {
    return () => console.log('This runs when the component unmounts.');
  }, []);
```

- [Custom Hooks for Objects(Deep Comparison)](https://stackoverflow.com/questions/54095994/react-useeffect-comparing-objects)

## useMemo

Memoizes expensive calculations, recalculates only when dependencies change

```
const value = expensiveCalculation(...);
// vs
const value = useMemo(() => expensiveCalculation(...), [DEPENDENCIES]);
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
const REDUCER_ACTION = {
  ACTION: 'ACTION',
} as const;
type REDUCER_ACTION_KEYS = keyof typeof REDUCER_ACTION;
export type ReducerAction = (typeof REDUCER_ACTION)[REDUCER_ACTION_KEYS];

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

    function handler(){
        dispatch({ type: "ACTION_TYPE", payload: data });
    }
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

Memoizes callback functions, preventing unnecessary re-renders in child components.

```
// Will ALWAYS get hit on re-render.
const fn = () => {
    doSomething();
};
// Will only re-render when props have changed
const fn = useCallback(() => {
    doSomething();
}, [DEPENDENCIES]);
```
