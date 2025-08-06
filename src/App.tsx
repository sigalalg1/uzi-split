import React, { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");

  const handleClick = () => {
    setMessage("Hello, world!");
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Uzi Split</h1>
      <button onClick={handleClick}>Click Me</button>
      <p>{message}</p>
    </div>
  );
}
