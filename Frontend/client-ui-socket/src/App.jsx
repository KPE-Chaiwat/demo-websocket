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
    setStatus("Connecting...");
    try {
      const res = await fetch("http://localhost:8080/api/mqtt/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (result.status === "connected") {
        setStatus("Connected");
        connectWebSocket();
      } else {
        setStatus("Failed: " + (result.message || "Unknown"));
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost:8080/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "disconnect") {
          console.warn("⚠️ MQTT disconnected by server");
          ws.close();
          setStatus("Disconnected");
        } else {
          setMessages((prev) => [msg, ...prev.slice(0, 99)]);
        }
      } catch {
        setMessages((prev) => [event.data, ...prev.slice(0, 99)]);
      }
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket closed");
      setStatus("Disconnected");
    };
  };

  const disconnectMQTT = async () => {
    try {
      await fetch("http://localhost:8080/api/mqtt/disconnect", {
        method: "POST",
      });
      if (wsRef.current) wsRef.current.close();
      wsRef.current = null;
      setStatus("Disconnected");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>🌐 Primus MQTT Dashboard (Controlled Disconnect)</h2>

      <div style={{ marginBottom: 10 }}>
        <button
          onClick={connectMQTT}
          style={{
            background: "green",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: 5,
            marginRight: 10,
          }}
        >
          ▶️ Connect
        </button>
        <button
          onClick={disconnectMQTT}
          style={{
            background: "red",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: 5,
          }}
        >
          ⏹ Disconnect
        </button>
      </div>

      <p>
        Status:{" "}
        <b style={{ color: status === "Connected" ? "green" : "red" }}>
          {status}
        </b>
      </p>

      <div
        style={{
          background: "#f5f5f5",
          padding: 10,
          borderRadius: 8,
          height: 400,
          overflowY: "scroll",
        }}
      >
        {messages.length === 0 ? (
          <p>No messages received...</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ background: "#fff", margin: 4, padding: 6 }}>
              <pre style={{ margin: 0 }}>
                {typeof m === "string" ? m : JSON.stringify(m, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
