
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wzenvycwzxitcmusaxak.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZW52eWN3enhpdGNtdXNheGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDMzNjgsImV4cCI6MjA2MTgxOTM2OH0.sbrjDCHlvPPKQkkHdF63lvDkWuCXKPD2gI3zPOdzYRo"
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading tasks:", error);
    } else {
      setTasks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    const { error } = await supabase
      .from("tasks")
      .insert([{ description: newTask }]);
    if (error) {
      console.error("Add task failed:", error);
    } else {
      setNewTask("");
      fetchTasks();
    }
  };

  const completeTask = async (id) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", id);
    if (error) {
      console.error("Complete task failed:", error);
    } else {
      fetchTasks();
    }
  };

  return (
    <div>
      <h1>Internal Tasks</h1>
      <div>
        <input
          placeholder="New Task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} style={{ margin: "0.5rem 0" }}>
              <span
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                  marginRight: "1rem"
                }}
              >
                {task.description}
              </span>
              {!task.completed && (
                <button onClick={() => completeTask(task.id)}>Complete</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
