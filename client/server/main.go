package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // อนุญาตทุก origin
	},
}

// --------------------
// เก็บ client ทั้งหมด
// --------------------
type Hub struct {
	clients map[*websocket.Conn]bool
	lock    sync.Mutex
}

var hub = Hub{clients: make(map[*websocket.Conn]bool)}

// --------------------
// ฟังก์ชัน broadcast
// --------------------
func (h *Hub) Broadcast(sender *websocket.Conn, msgType int, message []byte) {
	h.lock.Lock()
	defer h.lock.Unlock()

	for client := range h.clients {
		if client != sender { // ส่งให้ทุก client ยกเว้นตัวที่ส่งมา
			err := client.WriteMessage(msgType, message)
			if err != nil {
				log.Println("❌ Write error:", err)
				client.Close()
				delete(h.clients, client)
			}
		}
	}
}

// --------------------
// Handler หลัก
// --------------------
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	hub.lock.Lock()
	hub.clients[conn] = true
	hub.lock.Unlock()

	log.Println("✅ Client connected (total:", len(hub.clients), ")")

	for {
		mt, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("❌ Read error:", err)
			break
		}

		log.Printf("📩 Received: %s\n", msg)

		// ส่งกลับไปให้คนอื่น (เช่น dashboard)
		hub.Broadcast(conn, mt, msg)

		// ส่งยืนยันกลับ sender
		conn.WriteMessage(mt, []byte(fmt.Sprintf("Server got: %s", msg)))
	}

	// ลบ client เมื่อหลุด
	hub.lock.Lock()
	delete(hub.clients, conn)
	hub.lock.Unlock()
	log.Println("🔌 Client disconnected (total:", len(hub.clients), ")")
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)
	fmt.Println("🌐 WebSocket server started at :8080/ws")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
