package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/websocket"

	"checkers-backend/internal/models"
	"checkers-backend/internal/repository"
)

type RoomHandler struct {
	Repo             *repository.RoomRepository
	disconnectTimers map[string]*time.Timer
	lobbyConnections map[string]*websocket.Conn
}

func NewRoomHandler(repo *repository.RoomRepository) *RoomHandler {
	return &RoomHandler{
		Repo:             repo,
		disconnectTimers: make(map[string]*time.Timer),
		lobbyConnections: make(map[string]*websocket.Conn),
	}
}

type Response struct {
	Type string                 `json:"type"`
	Data map[string]interface{} `json:"data"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *RoomHandler) ServeWs(w http.ResponseWriter, r *http.Request) {
	playerID := r.Header.Get("PlayerID")
	if playerID == "" {
		http.Error(w, "PlayerID is required in headers", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Could not upgrade to WebSocket", http.StatusInternalServerError)
		return
	}
	defer conn.Close()
	defer h.handleDisconnect(conn)

	h.handleConnect(conn, playerID)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var request map[string]interface{}
		if err := json.Unmarshal(message, &request); err != nil {
			sendErrorMessage(conn, "Invalid request")
			continue
		}

		action, ok := request["action"].(string)
		if !ok {
			sendErrorMessage(conn, "Missing action")
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
			sendErrorMessage(conn, "Unknown action")
		}
	}
}

func (h *RoomHandler) handleConnect(conn *websocket.Conn, playerID string) {
	var response Response

	room := h.findRoomByPlayerID(playerID)

	if room != nil {
		for i := range room.Players {
			if room.Players[i].ID == playerID {
				room.Players[i].Connection = conn
				break
			}
		}

		response = Response{
			Type: "reconnect",
			Data: map[string]interface{}{
				"message": "Room found by PlayerID.",
				"room":    room,
			},
		}
	} else {
		h.lobbyConnections[playerID] = conn
		response = Response{
			Type: "no_room_found",
			Data: map[string]interface{}{
				"message": "No room associated with this PlayerID.",
				"rooms":   h.Repo.GetRooms(),
			},
		}
	}

	sendJSONResponse(conn, response)
}

func (h *RoomHandler) handleCreateRoom(conn *websocket.Conn, request map[string]interface{}) {
	name, _ := request["nickname"].(string)
	password, _ := request["password"].(string)
	pieceType, _ := request["piece_type"].(string)

	if name == "" {
		sendErrorMessage(conn, "Nickname is required")
		return
	}

	var room *models.Room
	switch pieceType {
	case "white":
		room = h.Repo.CreateRoom(name, password, models.WhitePawn, conn)
	case "black":
		room = h.Repo.CreateRoom(name, password, models.BlackPawn, conn)
	default:
		sendErrorMessage(conn, "Unknown piece type")
		return
	}

	room.Game = models.NewGame()

	response := Response{
		Type: "success",
		Data: map[string]interface{}{
			"message": "Room created successfully",
		},
	}

	sendJSONResponse(conn, response)

	rooms := h.Repo.GetRooms()
	response = Response{
		Type: "rooms_updated",
		Data: map[string]interface{}{
			"rooms": rooms,
		},
	}

	for _, conn := range h.lobbyConnections {
		sendJSONResponse(conn, response)
	}
}

func (h *RoomHandler) handleJoinRoom(conn *websocket.Conn, request map[string]interface{}) {
	roomID, _ := request["room_id"].(string)
	playerID, _ := request["player_id"].(string)

	if roomID == "" || playerID == "" {
		sendErrorMessage(conn, "Room ID and Player ID are required")
		return
	}

	success := h.Repo.AddPlayerToRoom(roomID, playerID, conn)
	if !success {
		sendErrorMessage(conn, "Failed to join room")
		return
	}

	room, _ := h.Repo.GetRoom(roomID)

	if timer, exists := h.disconnectTimers[playerID]; exists {
		timer.Stop()
		delete(h.disconnectTimers, playerID)
	}

	response, _ := json.Marshal(room)
	conn.WriteMessage(websocket.TextMessage, response)
}

func (h *RoomHandler) handleGetRooms(conn *websocket.Conn) {
	rooms := h.Repo.GetRooms()
	response, _ := json.Marshal(rooms)
	conn.WriteMessage(websocket.TextMessage, response)
}

func (h *RoomHandler) handleSendMessage(conn *websocket.Conn, request map[string]interface{}) {
	sender, _ := request["sender"].(string)
	content, _ := request["content"].(string)

	if sender == "" || content == "" {
		sendErrorMessage(conn, "Room ID, sender, and content are required")
		return
	}

	room := h.findRoomByConnection(conn)

	h.Repo.AddMessageToRoom(room, sender, content)

	response := Response{
		Type: "message_update",
		Data: map[string]interface{}{
			"messages": room.Messages,
		},
	}

	for _, player := range room.Players {
		sendJSONResponse(player.Connection, response)
	}
}

func (h *RoomHandler) handleMakeMove(conn *websocket.Conn, request map[string]interface{}) {
	roomID, _ := request["room_id"].(string)
	playerID, _ := request["player_id"].(string)
	from, _ := request["from"].(map[string]interface{})
	to, _ := request["to"].(map[string]interface{})

	if roomID == "" || playerID == "" || from == nil || to == nil {
		sendErrorMessage(conn, "Invalid move parameters")
		return
	}

	room, exists := h.Repo.GetRoom(roomID)
	if !exists {
		sendErrorMessage(conn, "Room not found")
		return
	}

	game := room.Game
	currentPlayer := getPlayerByConnection(room, conn)
	if currentPlayer == nil {
		sendErrorMessage(conn, "Player not found in the room")
		return
	}

	if !isPlayerTurn(game, currentPlayer) {
		sendErrorMessage(conn, "It's not your turn")
		return
	}

	move := models.Move{
		From: models.Position{Row: int(from["row"].(float64)), Col: int(from["col"].(float64))},
		To:   models.Position{Row: int(to["row"].(float64)), Col: int(to["col"].(float64))},
	}

	if err := game.MakeMove(move); err != nil {
		sendErrorMessage(conn, err.Error())
		return
	}

	if h.checkGameEnd(room, game) {
		return
	}

	for _, player := range room.Players {
		player.Connection.WriteJSON(game.Board)
	}
}

func (h *RoomHandler) checkGameEnd(room *models.Room, game *models.Game) bool {
	whiteCount, blackCount := countPieces(game)

	if whiteCount == 0 {
		h.declareWinner(room, models.BlackPawn)
		return true
	} else if blackCount == 0 {
		h.declareWinner(room, models.WhitePawn)
		return true
	}

	return false
}

func countPieces(game *models.Game) (whiteCount, blackCount int) {
	for _, row := range game.Board.Cells {
		for _, piece := range row {
			if piece == models.WhitePawn || piece == models.WhiteKing {
				whiteCount++
			} else if piece == models.BlackPawn || piece == models.BlackKing {
				blackCount++
			}
		}
	}
	return
}

func (h *RoomHandler) declareWinner(room *models.Room, winnerPieceType models.PieceType) {
	var winner *models.Player
	for _, player := range room.Players {
		if player.PieceType == winnerPieceType {
			winner = &player
			break
		}
	}

	if winner != nil {
		room.Winner = winner

		winnerResponse := map[string]interface{}{
			"type":    "game_end",
			"message": "You won because your opponent ran out of pieces.",
		}

		sendJSONResponse(winner.Connection, winnerResponse)

		for _, player := range room.Players {
			if player.PieceType != winnerPieceType {
				loserResponse := map[string]interface{}{
					"type":    "game_end",
					"message": "You lost because you ran out of pieces.",
				}

				sendJSONResponse(player.Connection, loserResponse)
			}
		}
	}

	h.Repo.DeleteRoom(room.ID)
}

func (h *RoomHandler) handleDisconnect(conn *websocket.Conn) {
	room, player := h.getRoomAndPlayerByConnection(conn)
	if room == nil || player == nil {
		return
	}

	if room.GameStarted {
		timer := time.AfterFunc(60*time.Second, func() {
			h.endGameWithWin(room, conn)
		})
		h.disconnectTimers[player.Nickname] = timer
	} else {
		h.Repo.DeleteRoom(room.ID)
	}
}

func (h *RoomHandler) endGameWithWin(room *models.Room, disconnectedPlayerConn *websocket.Conn) {
	var winner *models.Player
	for _, player := range room.Players {
		if player.Connection != disconnectedPlayerConn {
			winner = &player
			break
		}
	}

	if winner != nil {
		room.Winner = winner

		sendJSONResponse(winner.Connection, Response{
			Type:    "game_end",
			Message: "You won because your opponent disconnected.",
		})
	}

	h.Repo.DeleteRoom(room.ID)
}

func getPlayerByConnection(room *models.Room, conn *websocket.Conn) *models.Player {
	for i, player := range room.Players {
		if player.Connection == conn {
			return &room.Players[i]
		}
	}
	return nil
}

func (h *RoomHandler) getRoomAndPlayerByConnection(conn *websocket.Conn) (*models.Room, *models.Player) {
	for _, room := range h.Repo.GetRooms() {
		for i, player := range room.Players {
			if player.Connection == conn {
				return room, &room.Players[i]
			}
		}
	}
	return nil, nil
}

func isPlayerTurn(game *models.Game, player *models.Player) bool {
	return (game.CurrentTurn == models.WhitePawn && player.PieceType == models.WhitePawn) ||
		(game.CurrentTurn == models.BlackPawn && player.PieceType == models.BlackPawn)
}

func sendErrorMessage(conn *websocket.Conn, message string) {
	response := Response{
		Type: "error",
		Data: map[string]interface{}{
			"message": message,
		},
	}

	sendJSONResponse(conn, response)
}

func sendJSONResponse(conn *websocket.Conn, response interface{}) {
	data, err := json.Marshal(response)
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "error", "message": "Internal server error"}`))
		return
	}

	conn.WriteMessage(websocket.TextMessage, data)
}

func (h *RoomHandler) findRoomByPlayerID(playerID string) *models.Room {
	for _, room := range h.Repo.GetRooms() {
		for _, player := range room.Players {
			if player.ID == playerID {
				return room
			}
		}
	}

	return nil
}

func (h *RoomHandler) findRoomByConnection(conn *websocket.Conn) *models.Room {
	for _, room := range h.Repo.GetRooms() {
		for _, player := range room.Players {
			if player.Connection == conn {
				return room
			}
		}
	}

	return nil
}
