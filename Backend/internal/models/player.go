package models

import "github.com/gorilla/websocket"

type Player struct {
	Nickname   string          `json:"nickname"`
	PieceType  PieceType       `json:"piece_type"`
	Connection *websocket.Conn `json:"-"`
}
