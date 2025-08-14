# React

React is an un-opinionated frontend library framework that generally requires using other dependencies (libraries, tools, etc..).

[React Basics](./react-basics)
[React Hooks](./react-hooks)
[React Hooks](./react-redux)
[React Render](./react-render)
[React Typescript](./react-typescript)
[React Nuances](./react-nuances)

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
