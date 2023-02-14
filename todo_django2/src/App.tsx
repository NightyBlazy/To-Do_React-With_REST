import React from "react";
import { IActiveTodo } from "./types/interface";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";

function App() {
  /* States */
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [activeTodo, setactiveTodo] = useState<IActiveTodo>({
    id: null,
    title: "",
    completed: false,
  });
  const queryClient = useQueryClient();

  /* Fetch all TODO */
  async function todoFetch() {
    return await axios
      .get("http://localhost:8000/api/task-list/")
      .then((res) => res.data)
      .catch((err) => console.log(err));
  }

  const todoQuery = useQuery({
    queryKey: ["all-todo"],
    queryFn: todoFetch,
  });

  /* Create OR Update TODO */

  async function submitFunc(url: string) {
    return await axios
      .post(url, activeTodo, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => res.data);
  }

  const todoMutation = useMutation((url: string) => submitFunc(url), {
    onSuccess: (data) => {
      console.log("Post Success!!!");
      queryClient.setQueryData(["all-todo"], data);
    },
  });

  async function submitEvent() {
    var url = "http://localhost:8000/api/task-create/";

    if (editing == true) {
      url = `http://localhost:8000/api/task-update/${activeTodo?.id}/`;
      setEditing(false);
    }

    await todoMutation.mutate(url);
    setactiveTodo({
      id: null,
      title: "",
      completed: false,
    });
  }

  /* Edit TODO */

  function startEdit(prop: IActiveTodo) {
    setEditing(true);
    setactiveTodo(prop);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setactiveTodo({
      ...activeTodo,
      title: e.target.value,
    });
  }

  /* Delete TODO */
  async function deleteTodo(id: number) {
    return await axios
      .delete(`http://localhost:8000/api/task-delete/${id}/`)
      .then((res) => res.data);
  }

  const deleteMutation = useMutation((id: number) => deleteTodo(id), {
    onSuccess: (data) => {
      console.log("Delete Success!!!");
      queryClient.setQueryData(["all-todo"], data);
    },
  });

  /* Complete or Uncomplete TODO  */

  function CompleteUncomplete(prop: IActiveTodo) {
    prop.completed = !prop.completed;
    return axios
      .post(
        `http://localhost:8000/api/task-update/${prop.id}/`,
        { completed: prop.completed, title: prop.title },
        {
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((res) => res.data);
  }
  const Com_UnComMutation = useMutation(
    (prop: IActiveTodo) => CompleteUncomplete(prop),
    {
      onSuccess: (data) => {
        console.log("Post Success!!!");
        queryClient.setQueryData(["all-todo"], data);
      },
    }
  );
  async function onComUnCom(prop: IActiveTodo) {
    Com_UnComMutation.mutate(prop);
  }

  /* Query Status Check */
  if (todoQuery.status === "loading") return <h1>Loading...</h1>;
  if (todoQuery.status === "error") {
    return <h1>{JSON.stringify(todoQuery.error)}</h1>;
  }

  /* Template */
  return (
    <div className="container">
      <div id="task-container">
        <section id="form-wrapper">
          <form
            id="form"
            onSubmit={(e) => {
              e.preventDefault();
              submitEvent();
            }}
          >
            <div className="flex-wrapper">
              <div style={{ flex: 6 }}>
                <input
                  onChange={(e) => handleChange(e)}
                  className="form-control"
                  type="text"
                  id="title"
                  name="title"
                  value={activeTodo?.title}
                  placeholder="Add task..."
                />
              </div>
              <div style={{ flex: 1 }}>
                <button
                  id="submit"
                  type="submit"
                  className="btn btn-info"
                  name="Add"
                >
                  Query
                </button>
              </div>
            </div>
          </form>
        </section>
        <section id="list-wrapper">
          {todoQuery.data.map((todo: any) => (
            <div key={todo.id} className="task-wrapper flex-wrapper">
              <div
                onClick={() => {
                  onComUnCom(todo);
                }}
                style={{ flex: 7 }}
              >
                {todo.completed == false ? (
                  <span>{todo.title}</span>
                ) : (
                  <s>{todo.title}</s>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <button
                  onClick={() => {
                    startEdit(todo);
                  }}
                  className="btn btn-sm btn-outline-info"
                >
                  Edit
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <button
                  onClick={() => {
                    deleteMutation.mutate(todo.id);
                  }}
                  className="btn btn-sm btn-outline-dark delete"
                >
                  -
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;
