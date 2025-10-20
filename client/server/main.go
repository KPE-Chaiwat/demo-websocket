package main

import (
	"fmt"
	"log"

	paho "github.com/eclipse/paho.mqtt.golang"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors" // ✅ เพิ่ม middleware CORS
	"github.com/gofiber/websocket/v2"

	"websocket-demo/mqttclient" // ✅ ใช้ชื่อ module ของคุณเอง
)

var mqttConn *mqttclient.MQTTClient
var mqttStatus = "disconnected"
var mqttMessages = make(chan []byte, 100)

func main() {
	app := fiber.New()

	// ✅ เปิดให้ Frontend ทุกพอร์ตเข้าถึงได้ (dev mode)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,HEAD,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// ✅ REST API สำหรับ connect MQTT
	app.Post("/api/mqtt/connect", func(c *fiber.Ctx) error {
		var data struct {
			Server   string `json:"server"`
			Username string `json:"username"`
			Password string `json:"password"`
			ClientID string `json:"client_id"`
			Topic    string `json:"topic"`
		}

		if err := c.BodyParser(&data); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		broker := fmt.Sprintf("tcp://%s:1883", data.Server)
		mqttConn = &mqttclient.MQTTClient{}

		err := mqttConn.Connect(broker, data.Username, data.Password, data.ClientID)
		if err != nil {
			mqttStatus = "error"
			return c.Status(500).JSON(fiber.Map{
				"status":  "failed",
				"message": err.Error(),
			})
		}

		mqttStatus = "connected"

		// ✅ Subscribe MQTT Topic
		mqttConn.Subscribe(data.Topic, func(client paho.Client, msg paho.Message) {
			log.Printf("[MQTT] %s: %s", msg.Topic(), msg.Payload())
			mqttMessages <- msg.Payload()
		})

		return c.JSON(fiber.Map{"status": "connected", "topic": data.Topic})
	})

	// ✅ WebSocket สำหรับส่งข้อมูลให้ Frontend
	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		log.Println("🔌 WebSocket connected")
		defer c.Close()

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

	log.Println("🚀 API + WebSocket server started on :8080")
	app.Listen(":8080")
}
