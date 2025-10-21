package mqttclient

import (
	"log"
	"time"

	paho "github.com/eclipse/paho.mqtt.golang"
)

type MQTTClient struct {
	Client paho.Client
}

// Connect เชื่อมต่อกับ MQTT Broker
func (m *MQTTClient) Connect(broker, username, password, clientID string) error {
	opts := paho.NewClientOptions()
	opts.AddBroker(broker)
	opts.SetClientID(clientID)
	opts.SetUsername(username)
	opts.SetPassword(password)
	opts.SetKeepAlive(60 * time.Second)
	opts.SetPingTimeout(10 * time.Second)
	opts.OnConnect = func(c paho.Client) {
		log.Println("✅ MQTT connected successfully")
	}
	opts.OnConnectionLost = func(c paho.Client, err error) {
		log.Println("❌ MQTT connection lost:", err)
	}

	m.Client = paho.NewClient(opts)
	token := m.Client.Connect()
	if token.Wait() && token.Error() != nil {
		return token.Error()
	}
	return nil
}

// Subscribe สมัครรับข้อความจาก Topic
func (m *MQTTClient) Subscribe(topic string, callback paho.MessageHandler) error {
	if token := m.Client.Subscribe(topic, 0, callback); token.Wait() && token.Error() != nil {
		return token.Error()
	}
	log.Println("🟢 Subscribed to:", topic)
	return nil
}
