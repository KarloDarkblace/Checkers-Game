package models

type Player struct {
	ID       string `json:"id"`
	Nickname string `json:"nickname"`
	RoomID   string `json:"room_id"`
}
