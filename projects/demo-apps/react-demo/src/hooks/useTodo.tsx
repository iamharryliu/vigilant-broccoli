import { useContext } from "react";
import { TodoContext } from "../stores/todo/TodoContext";

export const useTodos = () => useContext(TodoContext);