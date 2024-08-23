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

func (r *RoomRepository) CreateRoom(playerName string, password string) *models.Room {
	r.mu.Lock()
	defer r.mu.Unlock()

	room := &models.Room{
		ID:          uuid.New().String(),
		Name:        playerName + " ROOM",
		Password:    password,
		Players:     []string{playerName},
		MaxPlayers:  2,
		GameStarted: false,
		Messages:    []models.Message{},
		Connections: make(map[string]*websocket.Conn),
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

func (r *RoomRepository) AddPlayerToRoom(roomID string, playerID string, conn *websocket.Conn) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	room, exists := r.rooms[roomID]
	if !exists || len(room.Players) >= room.MaxPlayers {
		return false
	}

	room.Players = append(room.Players, playerID)
	room.Connections[playerID] = conn
	if len(room.Players) == room.MaxPlayers {
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

func (r *RoomRepository) AddMessageToRoom(roomID string, sender string, content string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	room, exists := r.rooms[roomID]
	if !exists {
		return
	}

	message := models.Message{
		Sender:  sender,
		Content: content,
		Time:    time.Now().Format("15:04:05"),
	}

	room.Messages = append(room.Messages, message)

	for _, conn := range room.Connections {
		conn.WriteJSON(message)
	}
}
