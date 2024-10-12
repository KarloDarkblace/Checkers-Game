package repository

import (
	"checkers-backend/internal/models"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"sync"
	"time"
)

type RoomRepository struct {
	mu    sync.RWMutex
	rooms map[string]*models.Room
}

func NewRoomRepository() *RoomRepository {
	return &RoomRepository{
		rooms: make(map[string]*models.Room),
	}
}

const (
	MAX_PLAYERS = 2
)

func (r *RoomRepository) CreateRoom(playerName string, password string, pieceType models.PieceType, conn *websocket.Conn) *models.Room {
	r.mu.Lock()
	defer r.mu.Unlock()

	player := models.Player{
		Nickname:   playerName,
		PieceType:  pieceType,
		Connection: conn,
	}

	room := &models.Room{
		ID:          uuid.New().String(),
		Name:        playerName + " ROOM",
		Password:    password,
		Players:     []models.Player{player},
		GameStarted: false,
		Messages:    []models.Message{},
	}
	r.rooms[room.ID] = room

	return room
}

func (r *RoomRepository) GetRoom(id string) (*models.Room, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	room, exists := r.rooms[id]
	return room, exists
}

func (r *RoomRepository) AddPlayerToRoom(roomID string, playerName string, conn *websocket.Conn) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	room, exists := r.rooms[roomID]
	if !exists || len(room.Players) >= MAX_PLAYERS {
		return false
	}

	player := models.Player{
		Nickname:   playerName,
		Connection: conn,
	}

	if room.Players[0].PieceType == models.WhitePawn {
		player.PieceType = models.BlackPawn
	} else {
		player.PieceType = models.WhitePawn
	}

	room.Players = append(room.Players, player)
	if len(room.Players) == MAX_PLAYERS {
		room.GameStarted = true
	}

	return true
}

func (r *RoomRepository) GetRooms() []*models.Room {
	r.mu.RLock()
	defer r.mu.RUnlock()

	rooms := []*models.Room{}
	for _, room := range r.rooms {
		rooms = append(rooms, room)
	}
	return rooms
}

func (r *RoomRepository) AddMessageToRoom(room *models.Room, sender string, content string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	message := models.Message{
		Sender:  sender,
		Content: content,
		Time:    time.Now().Format("15:04:05"),
	}

	room.Messages = append(room.Messages, message)
}

func (r *RoomRepository) DeleteRoom(roomID string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.rooms, roomID)
}

func (r *RoomRepository) RemovePlayerFromRoom(roomID string, conn *websocket.Conn) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	room, exists := r.rooms[roomID]
	if !exists {
		return false
	}

	for i, player := range room.Players {
		if player.Connection == conn {
			room.Players = append(room.Players[:i], room.Players[i+1:]...)
			if room.GameStarted && len(room.Players) == 1 {
				room.Winner = &room.Players[0]
			}
			break
		}
	}

	if len(room.Players) == 0 {
		delete(r.rooms, roomID)
		return true
	}

	return true
}
