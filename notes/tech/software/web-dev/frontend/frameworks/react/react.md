# React

React is an un-opinionated frontend library framework that generally requires using other dependencies (libraries, tools, etc..).

[React Basics](./react-basics.md)
[React Hooks](./react-hooks.md)
[React Hooks](./react-redux.md)
[React Render](./react-render.md)
[React Typescript](./react-typescript.md)
[React Nuances](./react-nuances.md)

```
import { createContext, ReactNode, useContext } from "react"
interface ContextType {
}
const Context = createContext<ContextType | null>(null)
export const YourContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Context.Provider
      value={{}}
    >
      {children}
    </Context.Provider>
  )
}

export const useYourContext = () => {
  return useContext(Context) as ContextType
}
```

## References

- [ReactJS Tutorial for Beginners](https://www.youtube.com/playlist?list=PLC3y8-rFHvwgg3vaYJgHGnModB54rxOk3)
