import { useState, useRef } from "react";

function App() {
  // ฟอร์มค่าเริ่มต้น (ตาม Primus MQTT)
  const [settings, setSettings] = useState({
    server: "primus-cloud.com",
    username: "Primus",
    password: "1234567",
    client_id: "client_SwbZNsTGv9VCelur",
    topic: "RXEFiNP8lB/#",
  });

  const [status, setStatus] = useState("Disconnected");
  const [mqttStatus, setMqttStatus] = useState("-");
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  // -----------------------------
  // Connect to MQTT via API
  // -----------------------------
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
        setMqttStatus("✅ MQTT Connected");
        setStatus("MQTT Connected");
        connectWebSocket();
      } else {
        setMqttStatus("❌ MQTT Failed");
        setStatus("Failed to connect MQTT");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
      setMqttStatus("❌ Error");
    }
  };

  // -----------------------------
  // Connect WebSocket
  // -----------------------------
  const connectWebSocket = () => {
    if (wsRef.current) {
      console.warn("⚠️ Socket already connected");
      return;
    }

    const ws = new WebSocket("ws://localhost:8080/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setStatus("WebSocket Connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [msg, ...prev.slice(0, 99)]);
      } catch {
        setMessages((prev) => [event.data, ...prev.slice(0, 99)]);
      }
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket closed");
      wsRef.current = null;
      setStatus("Disconnected");
    };
  };

  // -----------------------------
  // Disconnect WebSocket + MQTT
  // -----------------------------
  const disconnectAll = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("Disconnected");
    setMqttStatus("Disconnected");
  };

  // -----------------------------
  // UI Render
  // -----------------------------
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>🌐 Primus MQTT → Go → Socket Dashboard</h2>

      {/* Settings */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <input
          placeholder="Server"
          value={settings.server}
          onChange={(e) =>
            setSettings({ ...settings, server: e.target.value })
          }
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
          onChange={(e) =>
            setSettings({ ...settings, topic: e.target.value })
          }
        />
      </div>

      {/* Buttons */}
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
          onClick={disconnectAll}
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

      {/* Status */}
      <p>
        MQTT Status:{" "}
        <b
          style={{
            color: mqttStatus.includes("✅") ? "green" : "red",
          }}
        >
          {mqttStatus}
        </b>
      </p>
      <p>
        Socket Status:{" "}
        <b
          style={{
            color: status.includes("Connected") ? "green" : "red",
          }}
        >
          {status}
        </b>
      </p>

      {/* Data */}
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
            <div
              key={i}
              style={{
                background: "white",
                marginBottom: 6,
                padding: 8,
                borderRadius: 4,
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              <pre style={{ margin: 0, fontSize: 13 }}>
                {typeof m === "string"
                  ? m
                  : JSON.stringify(m, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
