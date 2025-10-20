import { useState, useRef } from "react";

function App() {
  const [settings, setSettings] = useState({
    server: "primus-cloud.com",
    username: "Primus",
    password: "1234567",
    client_id: "client_SwbZNsTGv9VCelur",
    topic: "RXEFiNP8lB/#",
  });
  const [status, setStatus] = useState("Disconnected");
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  const connectMQTT = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/mqtt/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (result.status === "connected") {
        setStatus("Connected to MQTT");
        connectSocket();
      } else {
        setStatus("Failed: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  const connectSocket = () => {
    const ws = new WebSocket("ws://localhost:8080/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setStatus("Socket Connected");
    };

    ws.onmessage = (event) => {
      console.log("📩 Message:", event.data);
      setMessages((prev) => [event.data, ...prev]);
    };

    ws.onclose = () => {
      console.log("❌ Socket disconnected");
      setStatus("Disconnected");
    };
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>🌐 Primus MQTT → Go → Socket Demo</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Server"
          value={settings.server}
          onChange={(e) => setSettings({ ...settings, server: e.target.value })}
        />
        <input
          placeholder="Username"
          value={settings.username}
          onChange={(e) =>
            setSettings({ ...settings, username: e.target.value })
          }
        />
        <input
          placeholder="Password"
          type="password"
          value={settings.password}
          onChange={(e) =>
            setSettings({ ...settings, password: e.target.value })
          }
        />
        <input
          placeholder="Client ID"
          value={settings.client_id}
          onChange={(e) =>
            setSettings({ ...settings, client_id: e.target.value })
          }
        />
        <input
          placeholder="Topic"
          value={settings.topic}
          onChange={(e) => setSettings({ ...settings, topic: e.target.value })}
        />
        <button onClick={connectMQTT}>Connect</button>
      </div>

      <p>
        Status:{" "}
        <b style={{ color: status.includes("Connected") ? "green" : "red" }}>
          {status}
        </b>
      </p>

      <div
        style={{
          background: "#eee",
          padding: 10,
          borderRadius: 6,
          height: 300,
          overflowY: "scroll",
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <code>{m}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
