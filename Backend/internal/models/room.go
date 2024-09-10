package models

type Room struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Password    string    `json:"password"`
	GameStarted bool      `json:"game_started"`
	Game        *Game     `json:"game"`
	Winner      *Player   `json:"winner,omitempty"`
	Players     []Player  `json:"players"`
	Messages    []Message `json:"messages"`
}
