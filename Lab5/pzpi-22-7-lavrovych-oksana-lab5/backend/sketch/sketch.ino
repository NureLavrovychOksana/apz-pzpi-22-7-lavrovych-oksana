#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <MQUnifiedsensor.h>
#include <ArduinoJson.h>

// Wi-Fi конфігурація
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// MQTT конфігурація
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 8883;
const char* mqtt_topic = "iot/data";

// Налаштування сенсорів
#define DHTPIN 23        // Пін для DHT22
#define DHTTYPE DHT22    // Тип сенсора DHT
DHT dht(DHTPIN, DHTTYPE);

#define MQ2PIN A0        // Пін для MQ-2
#define MQ135PIN A1      // Пін для MQ-135
#define Board "ESP32"
#define Voltage_Resolution 3.3
#define ADC_Bit_Resolution 12

MQUnifiedsensor mq2(Board, Voltage_Resolution, ADC_Bit_Resolution, MQ2PIN, "MQ-2");
MQUnifiedsensor mq135(Board, Voltage_Resolution, ADC_Bit_Resolution, MQ135PIN, "MQ-135");

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);

  // Ініціалізація Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("Connecting to WiFi...");
    delay(1000);
  }
  Serial.println("Connected to WiFi");

  // Ініціалізація MQTT
  client.setServer(mqtt_server, mqtt_port);

  // Ініціалізація сенсорів
  dht.begin();
  mq2.setRegressionMethod(1);    // Лінійна регресія для CO
  mq2.init();
  mq135.setRegressionMethod(1); // Лінійна регресія для диму
  mq135.init();

  Serial.println("System initialized");
}

void loop() {

  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  mq2.update();
  float gasValue = mq2.readSensor(); 

  mq135.update();
  float smokeValue = mq135.readSensor();

  // Обробка даних
  if (isnan(temperature) || isnan(humidity) || isnan(gasValue) || isnan(smokeValue)) {
    Serial.println("Failed to read data from sensors");
    return;
  }

  // Формування JSON
  StaticJsonDocument<256> jsonDoc;
  jsonDoc["temperature"] = temperature;
  jsonDoc["humidity"] = humidity;
  jsonDoc["gas_ppm"] = gasValue;
  jsonDoc["smoke_ppm"] = smokeValue;

  char jsonBuffer[256];
  serializeJson(jsonDoc, jsonBuffer);

  // Відправлення даних до MQTT
  if (client.publish(mqtt_topic, jsonBuffer)) {
    Serial.println("Data published:");
    Serial.println(jsonBuffer);
  } else {
    Serial.println("Failed to publish data");
  }

  delay(5000); 
}

void reconnect() {
  // Спроба підключення до MQTT
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed, rc=");
      Serial.println(client.state());
      delay(5000);
    }
  }
}
