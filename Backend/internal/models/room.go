package models

import "github.com/gorilla/websocket"

type Room struct {
	ID          string                     `json:"id"`
	Name        string                     `json:"name"`
	Password    string                     `json:"password"`
	Players     []string                   `json:"players"`
	MaxPlayers  int                        `json:"max_players"`
	GameStarted bool                       `json:"game_started"`
	Messages    []Message                  `json:"messages"`
	Connections map[string]*websocket.Conn `json:"-"`
	Game        *Game                      `json:"game"`
}
