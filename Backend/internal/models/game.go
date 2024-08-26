package models

import (
	"errors"
	"math"
)

var (
	ErrInvalidMove = errors.New("invalid move")
)

type Game struct {
	Board       *Board    `json:"board"`
	CurrentTurn PieceType `json:"current_turn"`
}

func NewGame() *Game {
	return &Game{
		Board:       NewBoard(),
		CurrentTurn: WhitePiece,
	}
}

func (g *Game) MakeMove(move Move) error {
	piece := g.Board.Cells[move.From.Row][move.From.Col]

	if piece == Empty || (piece == WhitePiece && g.CurrentTurn != WhitePiece) || (piece == BlackPiece && g.CurrentTurn != BlackPiece) {
		return ErrInvalidMove
	}

	if !g.isValidMove(move, piece) {
		return ErrInvalidMove
	}

	g.Board.Cells[move.To.Row][move.To.Col] = piece
	g.Board.Cells[move.From.Row][move.From.Col] = Empty

	if (piece == WhitePiece && move.To.Row == 7) || (piece == BlackPiece && move.To.Row == 0) {
		if piece == WhitePiece {
			g.Board.Cells[move.To.Row][move.To.Col] = WhiteKing
		} else {
			g.Board.Cells[move.To.Row][move.To.Col] = BlackKing
		}
	}

	if g.CurrentTurn == WhitePiece {
		g.CurrentTurn = BlackPiece
	} else {
		g.CurrentTurn = WhitePiece
	}

	return nil
}

func (g *Game) isValidMove(move Move, piece PieceType) bool {
	rowDiff := move.To.Row - move.From.Row
	colDiff := move.To.Col - move.From.Col

	if g.Board.Cells[move.To.Row][move.To.Col] != Empty || math.Abs(float64(rowDiff)) != 1 || math.Abs(float64(colDiff)) != 1 {
		return false
	}

	if piece == WhitePiece && rowDiff != 1 {
		return false
	}
	if piece == BlackPiece && rowDiff != -1 {
		return false
	}

	if piece == WhiteKing || piece == BlackKing {
		if math.Abs(float64(rowDiff)) != math.Abs(float64(colDiff)) {
			return false
		}
	}

	return true
}
