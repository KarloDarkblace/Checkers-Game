package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/websocket"

	"checkers-backend/internal/models"
	"checkers-backend/internal/repository"
)

type RoomHandler struct {
	Repo *repository.RoomRepository
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *RoomHandler) ServeWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Could not upgrade to WebSocket", http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var request map[string]interface{}
		if err := json.Unmarshal(message, &request); err != nil {
			conn.WriteMessage(websocket.TextMessage, []byte("Invalid request"))
			continue
		}

		action, ok := request["action"].(string)
		if !ok {
			conn.WriteMessage(websocket.TextMessage, []byte("Missing action"))
			continue
		}

		switch action {
		case "create_room":
			h.handleCreateRoom(conn, request)
		case "join_room":
			h.handleJoinRoom(conn, request)
		case "get_rooms":
			h.handleGetRooms(conn)
		case "send_message":
			h.handleSendMessage(conn, request)
		case "make_move":
			h.handleMakeMove(conn, request)
		default:
			conn.WriteMessage(websocket.TextMessage, []byte("Unknown action"))
		}
	}
}

func (h *RoomHandler) handleCreateRoom(conn *websocket.Conn, request map[string]interface{}) {
	name, _ := request["nickname"].(string)
	password, _ := request["password"].(string)

	if name == "" {
		conn.WriteMessage(websocket.TextMessage, []byte("Nickname is required"))
		return
	}

	room := h.Repo.CreateRoom(name, password)
	h.Repo.AddPlayerToRoom(room.ID, name, conn)

	room.Game = models.NewGame()

	response, _ := json.Marshal(room)
	conn.WriteMessage(websocket.TextMessage, response)
}

func (h *RoomHandler) handleJoinRoom(conn *websocket.Conn, request map[string]interface{}) {
	roomID, _ := request["room_id"].(string)
	playerID, _ := request["player_id"].(string)

	if roomID == "" || playerID == "" {
		conn.WriteMessage(websocket.TextMessage, []byte("Room ID and Player ID are required"))
		return
	}

	success := h.Repo.AddPlayerToRoom(roomID, playerID, conn)
	if !success {
		conn.WriteMessage(websocket.TextMessage, []byte("Failed to join room"))
		return
	}

	room, _ := h.Repo.GetRoom(roomID)

	response, _ := json.Marshal(room)
	conn.WriteMessage(websocket.TextMessage, response)
}

func (h *RoomHandler) handleGetRooms(conn *websocket.Conn) {
	rooms := h.Repo.GetRooms()

	response, _ := json.Marshal(rooms)
	conn.WriteMessage(websocket.TextMessage, response)
}

func (h *RoomHandler) handleSendMessage(conn *websocket.Conn, request map[string]interface{}) {
	roomID, _ := request["room_id"].(string)
	sender, _ := request["sender"].(string)
	content, _ := request["content"].(string)

	if roomID == "" || sender == "" || content == "" {
		conn.WriteMessage(websocket.TextMessage, []byte("Room ID, sender, and content are required"))
		return
	}

	h.Repo.AddMessageToRoom(roomID, sender, content)
}

func (h *RoomHandler) handleMakeMove(conn *websocket.Conn, request map[string]interface{}) {
	roomID, _ := request["room_id"].(string)
	playerID, _ := request["player_id"].(string)
	from, _ := request["from"].(map[string]interface{})
	to, _ := request["to"].(map[string]interface{})

	if roomID == "" || playerID == "" || from == nil || to == nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Invalid move parameters"))
		return
	}

	room, exists := h.Repo.GetRoom(roomID)
	if !exists {
		conn.WriteMessage(websocket.TextMessage, []byte("Room not found"))
		return
	}

	game := room.Game
	move := models.Move{
		From: models.Position{Row: int(from["row"].(float64)), Col: int(from["col"].(float64))},
		To:   models.Position{Row: int(to["row"].(float64)), Col: int(to["col"].(float64))},
	}
	err := game.MakeMove(move)
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
		return
	}

	for _, playerConn := range room.Connections {
		playerConn.WriteJSON(game.Board)
	}
}
