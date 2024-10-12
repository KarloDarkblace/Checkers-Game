package models

import "github.com/gorilla/websocket"

type Player struct {
	ID         string          `json:"-"`
	Nickname   string          `json:"nickname"`
	PieceType  PieceType       `json:"piece_type"`
	Connection *websocket.Conn `json:"-"`
}
