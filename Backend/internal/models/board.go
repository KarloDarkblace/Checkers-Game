package models

type PieceType int

const (
	Empty PieceType = iota
	WhitePawn
	BlackPawn
	WhiteKing
	BlackKing
)

type Position struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

type Move struct {
	From Position `json:"from"`
	To   Position `json:"to"`
}

type Board struct {
	Cells [8][8]PieceType `json:"cells"`
}

func NewBoard() *Board {
	board := &Board{}

	for row := 0; row < 3; row++ {
		for col := 0; col < 8; col++ {
			if (row+col)%2 == 1 {
				board.Cells[row][col] = BlackPawn
			}
		}
	}

	for row := 5; row < 8; row++ {
		for col := 0; col < 8; col++ {
			if (row+col)%2 == 1 {
				board.Cells[row][col] = WhitePawn
			}
		}
	}

	return board
}
