import { useEffect, useState } from "react";

function App() {
  const [ws, setWs] = useState(null);
  const [status, setStatus] = useState("Disconnected");
  const [intervalId, setIntervalId] = useState(null);
  const [deviceName, setDeviceName] = useState("Sensor-01");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    setWs(socket);

    socket.onopen = () => {
      setStatus("Connected");
      console.log("✅ Sensor connected to server");

      // ส่งข้อมูลจำลองทุก 2 วินาที
      const id = setInterval(() => {
        const data = {
          device: deviceName,
          temperature: (20 + Math.random() * 10).toFixed(2),
          humidity: (40 + Math.random() * 20).toFixed(2),
          timestamp: new Date().toISOString(),
        };
        socket.send(JSON.stringify(data));
        console.log("📤 Sent:", data);
      }, 2000);

      setIntervalId(id);
    };

    socket.onmessage = (event) => {
      console.log("📨 Message from server:", event.data);
    };

    socket.onclose = () => {
      setStatus("Disconnected");
      if (intervalId) clearInterval(intervalId);
    };

    return () => {
      socket.close();
      if (intervalId) clearInterval(intervalId);
    };
  }, [deviceName]);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>📡 IoT Sensor Simulator</h2>
      <p>Status: <b style={{ color: status === "Connected" ? "green" : "red" }}>{status}</b></p>

      <label>
        Device Name:
        <input
          type="text"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      </label>

      <div style={{ marginTop: 20 }}>
        <p>Sending random temperature and humidity data every 2 seconds.</p>
      </div>
    </div>
  );
}

export default App;
