"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdById: string | null;
  createdBy: { id: string; firstName: string | null; lastName: string | null; username: string | null } | null;
}

interface TodoListProps {
  todos: Todo[];
}

export function TodoList({ todos: initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState(initialTodos);
  const [newText, setNewText] = useState("");

  async function addTodo() {
    if (!newText.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText.trim() }),
    });
    if (res.ok) {
      const todo = await res.json();
      setTodos((prev) => [...prev, todo]);
      setNewText("");
    }
  }

  async function toggleTodo(id: number, completed: boolean) {
    const res = await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
    if (res.ok) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
      );
    }
  }

  async function deleteTodo(id: number) {
    const res = await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
        className="flex gap-2"
      >
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Новая покупка..."
          className="flex-1"
        />
        <Button type="submit">Добавить</Button>
      </form>

      <div className="space-y-2">
        {todos.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Список пуст
          </p>
        )}
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 border rounded-lg px-3 py-2"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id, todo.completed)}
              className="size-4"
            />
            <span
              className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {todo.text}
              {todo.createdBy && (
                <span className="text-xs text-muted-foreground ml-1">
                  — {todo.createdBy.firstName || todo.createdBy.username || todo.createdBy.id}
                </span>
              )}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => deleteTodo(todo.id)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}