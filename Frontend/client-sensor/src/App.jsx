import { useEffect } from "react";

function App() {
  useEffect(() => {
    const sensors = [
      { room: "RoomA", device: "Sensor-1" },
      { room: "RoomB", device: "Sensor-2" },
    ];

    sensors.forEach((s) => {
      const socket = new WebSocket(`ws://localhost:8080/ws?room=${s.room}`);

      socket.onopen = () => {
        console.log(`✅ ${s.device} connected to ${s.room}`);
        setInterval(() => {
          const data = {
            room: s.room,
            device: s.device,
            temperature: (20 + Math.random() * 10).toFixed(2),
            humidity: (40 + Math.random() * 20).toFixed(2),
            timestamp: new Date().toISOString(),
          };
          socket.send(JSON.stringify(data));
        }, 2000);
      };
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📡 Sensor Simulator</h2>
      <p>Simulating 2 sensors sending data to RoomA and RoomB...</p>
    </div>
  );
}

export default App;
