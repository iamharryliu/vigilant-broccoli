# React

React is an un-opinionated frontend library framework that generally requires using other dependencies (libraries, tools, etc..).

[React Basics](https://harryliu.dev/docs-md/react-basics)
[React Hooks](https://harryliu.dev/docs-md/react-hooks)
[React Render](https://harryliu.dev/docs-md/react-render)
[React Typescript](https://harryliu.dev/docs-md/react-typescript)
[React Nuances](https://harryliu.dev/docs-md/react-nuances)

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
