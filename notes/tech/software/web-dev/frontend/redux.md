# Redux

Redux is a state management pattern that utilizes state containers. State containers are useful for multi-component applications where the components share state. Using Redux patterns avoids passing values to parent components to reach other component nodes.

## When are Redux Patterns Useful?

- State management for large complicated applications where there are lots of state changes happening.
- Keeping a track record of state changes.
- Working with teams to have a standard way of doing things so that the development cycle does not end up becoming the wild west.

## Design

### Core Concepts

- Store - Holds the state of the application.
- Actions - Describes a change in state.
- Reducers - Changes state variables.
- Effects - Used to handle side effects and firing off more actions.
- Selectors - Used to parse for specific state values.

### Summary

- Store state variable that is wrapped around the application.
- Switch statement to handle actions and reducer effects.

```
const redux = require('redux')
const createStore = redux.createStore
const combineReduces = redux.combineReducers

const ACTION_NAME = 'ACTION_NAME'
function action(){
	return {
		type: ACTION_NAME,
		info: 'Action info'
	}
}
function reduxAction = () => {
	return function(dispatch){
		dispatch(action())
		axios.get('url')
			.then(res => {
			    disptach(reduxActionSuccess(res))
			})
			.catch(err => {
				dispatch(reduxActionError(data))
			})
	}
}

const initialState = {...}
cosnt reducer (state = initialState, action) => {
	switch(action.type){
		case ACTION_NAME: return {
			...state,
			state changes...
		}
		default: return state
	}
}

const rootReducer = combineReducers({
	firstReducer: reducer,
})
const store = createStore(reducer)

unsubscribe = store.subscribe()
store.getState()
store.dispatch(action())
unsubscribe()
```

## References

[React Redux Tutorial by Codevolution]()
