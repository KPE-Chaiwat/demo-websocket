import { useEffect, useState } from "react";

function App() {
  const [ws, setWs] = useState(null);
  const [status, setStatus] = useState("Disconnected");
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    // สร้าง websocket connection
    const socket = new WebSocket("ws://localhost:8080/ws");
    setWs(socket);

    socket.onopen = () => {
      console.log("✅ Connected to WebSocket server");
      setStatus("Connected");
    };

    socket.onmessage = (event) => {
      try {
        // แปลง JSON ที่ sensor ส่งมา
        const data = JSON.parse(event.data);
        console.log("📨 Data from server:", data);

        // ตรวจสอบว่าเป็นข้อมูล sensor หรือข้อความทั่วไป
        if (data.device && data.temperature && data.humidity) {
          setDataList((prev) => [data, ...prev.slice(0, 49)]); // เก็บล่าสุด 50 รายการ
        } else {
          console.log("⚙️ Server message:", event.data);
        }
      } catch {
        console.log("💬 Raw message:", event.data);
      }
    };

    socket.onclose = () => {
      setStatus("Disconnected");
    };

    return () => socket.close();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>📊 Real-time Sensor Dashboard</h2>
      <p>
        Connection:{" "}
        <b style={{ color: status === "Connected" ? "green" : "red" }}>
          {status}
        </b>
      </p>

      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%" }}
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
