package main

import (
	"fmt"
	"log"
	"sync"

	paho "github.com/eclipse/paho.mqtt.golang"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/swagger"
	"github.com/gofiber/websocket/v2"

	_ "websocket-demo/docs" // ✅ Import เอกสาร Swagger (auto-generated)
	"websocket-demo/mqttclient"
)

var mqttConn *mqttclient.MQTTClient
var mqttStatus = "disconnected"
var mqttMessages = make(chan []byte, 100)
var wsClients = make(map[*websocket.Conn]bool)
var mu sync.Mutex

// @title Primus MQTT API
// @version 1.0
// @description Fiber API ที่เชื่อมต่อ Primus MQTT Broker แล้วส่งต่อผ่าน WebSocket
// @host localhost:8080
// @BasePath /

type ConnectRequest struct {
	Server   string `json:"server" example:"primus-cloud.com"`
	Username string `json:"username" example:"Primus"`
	Password string `json:"password" example:"1234567"`
	ClientID string `json:"client_id" example:"client_SwbZNsTGv9VCelur"`
	Topic    string `json:"topic" example:"RXEFiNP8lB/#"`
}

type ConnectResponse struct {
	Status string `json:"status" example:"connected"`
	Topic  string `json:"topic" example:"RXEFiNP8lB/#"`
}

type DisconnectResponse struct {
	Status string `json:"status" example:"disconnected"`
}

// @Summary Connect to MQTT broker
// @Description Connects the Go Fiber API to Primus MQTT broker and subscribes to topic
// @Tags MQTT
// @Accept json
// @Produce json
// @Param data body ConnectRequest true "MQTT Config"
// @Success 200 {object} ConnectResponse
// @Router /api/mqtt/connect [post]
func connectMQTTHandler(c *fiber.Ctx) error {
	var data ConnectRequest
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	broker := fmt.Sprintf("tcp://%s:1883", data.Server)
	mqttConn = &mqttclient.MQTTClient{}
	err := mqttConn.Connect(broker, data.Username, data.Password, data.ClientID)
	if err != nil {
		mqttStatus = "error"
		return c.Status(500).JSON(fiber.Map{"status": "failed", "message": err.Error()})
	}

	mqttStatus = "connected"
	mqttConn.Subscribe(data.Topic, func(client paho.Client, msg paho.Message) {
		log.Printf("[MQTT] %s: %s", msg.Topic(), msg.Payload())
		mqttMessages <- msg.Payload()
	})

	return c.JSON(ConnectResponse{Status: "connected", Topic: data.Topic})
}

// @Summary Disconnect MQTT
// @Description Disconnects from Primus MQTT broker and closes all WebSocket connections
// @Tags MQTT
// @Success 200 {object} DisconnectResponse
// @Router /api/mqtt/disconnect [post]
func disconnectMQTTHandler(c *fiber.Ctx) error {
	if mqttConn != nil && mqttConn.Client != nil && mqttConn.Client.IsConnected() {
		mqttConn.Client.Disconnect(250)
		mqttStatus = "disconnected"
		log.Println("🛑 MQTT Disconnected by user")
	}

	mu.Lock()
	for conn := range wsClients {
		conn.WriteMessage(websocket.TextMessage, []byte(`{"event":"disconnect","message":"MQTT disconnected"}`))
		conn.Close()
		delete(wsClients, conn)
	}
	mu.Unlock()

	return c.JSON(DisconnectResponse{Status: "disconnected"})
}

func main() {
	app := fiber.New()

	// ✅ Allow CORS for all origins (Dev mode)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// ✅ API Routes
	app.Post("/api/mqtt/connect", connectMQTTHandler)
	app.Post("/api/mqtt/disconnect", disconnectMQTTHandler)

	// ✅ WebSocket route
	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		mu.Lock()
		wsClients[c] = true
		mu.Unlock()
		log.Println("🔌 WebSocket connected")

		defer func() {
			mu.Lock()
			delete(wsClients, c)
			mu.Unlock()
			c.Close()
			log.Println("🔌 WebSocket closed")
		}()

		for {
			select {
			case msg := <-mqttMessages:
				if err := c.WriteMessage(websocket.TextMessage, msg); err != nil {
					log.Println("❌ WebSocket write error:", err)
					return
				}
			}
		}
	}))

	// ✅ Swagger UI
	app.Get("/api/docs/*", swagger.HandlerDefault) // เปิดที่: http://localhost:8080/api/docs/index.html

	log.Println("🚀 API + WebSocket server started on :8080")
	app.Listen(":8080")
}
