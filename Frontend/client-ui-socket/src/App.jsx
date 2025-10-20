import { useState, useRef, useEffect } from "react";

function App() {
  const [status, setStatus] = useState("Disconnected");
  const [dataList, setDataList] = useState([]);
  const [autoReconnect, setAutoReconnect] = useState(true);

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const manualStop = useRef(false); // ✅ ตัวบอกว่าผู้ใช้กด Stop เองหรือไม่

  // --------------------------
  // ฟังก์ชันเริ่มเชื่อมต่อ WebSocket
  // --------------------------
  const startConnection = () => {
    if (wsRef.current) {
      console.warn("⚠️ Already connected or connecting...");
      return;
    }

    manualStop.current = false; // รีเซ็ตค่า เพราะนี่คือการเชื่อมต่อใหม่
    console.log("🔄 Attempting to connect WebSocket...");
    const socket = new WebSocket("ws://localhost:8080/ws");
    wsRef.current = socket;

    setStatus("Connecting...");

    socket.onopen = () => {
      console.log("✅ Connected to WebSocket server");
      setStatus("Connected");
      clearTimeout(reconnectTimer.current);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.device && data.temperature && data.humidity) {
          setDataList((prev) => [data, ...prev.slice(0, 49)]);
        }
      } catch {
        console.log("💬 Message:", event.data);
      }
    };

    socket.onclose = (event) => {
      console.warn("🔌 Disconnected from server");
      wsRef.current = null;

      // 🔥 Reconnect เฉพาะเมื่อผู้ใช้ไม่ได้กด stop
      if (!manualStop.current && autoReconnect) {
        setStatus("Reconnecting...");
        console.log("⏳ Will attempt to reconnect in 5 seconds...");
        reconnectTimer.current = setTimeout(() => {
          startConnection();
        }, 5000);
      } else {
        setStatus("Disconnected");
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      socket.close();
    };
  };

  // --------------------------
  // ฟังก์ชันปิดการเชื่อมต่อ
  // --------------------------
  const stopConnection = () => {
    if (wsRef.current) {
      console.log("🛑 Manual stop connection");
      manualStop.current = true; // ✅ บอกให้ระบบรู้ว่าเป็น stop โดยผู้ใช้
      wsRef.current.close();
      wsRef.current = null;
      setStatus("Disconnected");
      clearTimeout(reconnectTimer.current);
    }
  };

  // --------------------------
  // Cleanup เมื่อ component ถูก unmount
  // --------------------------
  useEffect(() => {
    return () => {
      manualStop.current = true;
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimer.current);
    };
  }, []);

  // --------------------------
  // UI
  // --------------------------
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>📊 Real-time Sensor Dashboard</h2>

      <div style={{ marginBottom: 15 }}>
        <p>
          Connection:{" "}
          <b
            style={{
              color:
                status === "Connected"
                  ? "green"
                  : status === "Reconnecting..."
                  ? "orange"
                  : "red",
            }}
          >
            {status}
          </b>
        </p>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {status === "Disconnected" || status === "Reconnecting..." ? (
            <button
              onClick={startConnection}
              style={{
                padding: "8px 16px",
                background: "green",
                color: "white",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              ▶️ Start Connection
            </button>
          ) : (
            <button
              onClick={stopConnection}
              style={{
                padding: "8px 16px",
                background: "red",
                color: "white",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              ⏹ Stop Connection
            </button>
          )}

          <label style={{ marginLeft: "10px", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={autoReconnect}
              onChange={(e) => setAutoReconnect(e.target.checked)}
              style={{ marginRight: "6px" }}
            />
            Auto Reconnect
          </label>
        </div>
      </div>

      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          background: "#fff",
        }}
      >
        <thead style={{ background: "#eee" }}>
          <tr>
            <th>#</th>
            <th>Device</th>
            <th>Temperature (°C)</th>
            <th>Humidity (%)</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {dataList.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No data yet...
              </td>
            </tr>
          ) : (
            dataList.map((d, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{d.device}</td>
                <td>{d.temperature}</td>
                <td>{d.humidity}</td>
                <td>{new Date(d.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
