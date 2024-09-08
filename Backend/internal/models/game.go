package models

import (
	"errors"
	"math"
)

var (
	TopLeft     = Position{Row: -1, Col: -1}
	TopRight    = Position{Row: -1, Col: 1}
	BottomLeft  = Position{Row: 1, Col: -1}
	BottomRight = Position{Row: 1, Col: 1}
)

type Game struct {
	Board       *Board    `json:"board"`
	CurrentTurn PieceType `json:"current_turn"`
}

func NewGame() *Game {
	return &Game{
		Board:       NewBoard(),
		CurrentTurn: WhitePawn,
	}
}

func (g *Game) MakeMove(move Move) error {
	piece := g.Board.Cells[move.From.Row][move.From.Col]

	if g.CurrentTurn == WhitePawn && (piece == BlackPawn || piece == BlackKing) {
		return errors.New("invalid move")
	} else if g.CurrentTurn == BlackPawn && (piece == WhitePawn || piece == WhiteKing) {
		return errors.New("invalid move")
	} else if g.CurrentTurn == Empty {
		return errors.New("invalid move")
	}

	if !g.isValidMove(move) {
		return errors.New("invalid move")
	}

	g.Board.Cells[move.To.Row][move.To.Col] = piece
	g.Board.Cells[move.From.Row][move.From.Col] = Empty

	if math.Abs(float64(move.To.Row-move.From.Row)) == 2.0 {
		capturedRow := (move.From.Row + move.To.Row) / 2
		capturedCol := (move.From.Col + move.To.Col) / 2
		g.Board.Cells[capturedRow][capturedCol] = Empty
	}

	if g.CurrentTurn == WhitePawn && move.To.Row == 7 {
		g.Board.Cells[move.To.Row][move.To.Col] = WhiteKing
	} else if g.CurrentTurn == BlackPawn && move.To.Row == 0 {
		g.Board.Cells[move.To.Row][move.To.Col] = BlackKing
	}

	if g.CurrentTurn == WhitePawn {
		g.CurrentTurn = BlackPawn
	} else {
		g.CurrentTurn = WhitePawn
	}

	return nil
}

func (g *Game) isValidMove(move Move) bool {
	availableMoves := g.getAvailableMoves(move.From)

	for _, availableMove := range availableMoves {
		if availableMove == move.To {
			return true
		}
	}

	return false
}

func (g *Game) isValidCell(pos Position) bool {
	return pos.Row >= 0 && pos.Row < 8 && pos.Col >= 0 && pos.Col < 8
}

func (g *Game) getAvailableMoves(pos Position) []Position {
	var availableMoves []Position

	availableDirections := g.getAvailableDirections(pos)
	captureMoves := g.getCaptureMoves(pos, availableDirections)

	if len(captureMoves) > 0 {
		availableMoves = append(availableMoves, captureMoves...)
	} else {
		piece := g.Board.Cells[pos.Row][pos.Col]
		if piece == WhiteKing || piece == BlackKing {
			for _, dir := range availableDirections {
				for step := 1; ; step++ {
					newPos := Position{
						Row: pos.Row + step*dir.Row,
						Col: pos.Col + step*dir.Col,
					}

					if !g.isValidCell(newPos) {
						break
					}

					if g.Board.Cells[newPos.Row][newPos.Col] == Empty {
						availableMoves = append(availableMoves, newPos)
					} else {
						if (piece == WhiteKing && (g.Board.Cells[newPos.Row][newPos.Col] == WhitePawn || g.Board.Cells[newPos.Row][newPos.Col] == WhiteKing)) ||
							(piece == BlackKing && (g.Board.Cells[newPos.Row][newPos.Col] == BlackPawn || g.Board.Cells[newPos.Row][newPos.Col] == BlackKing)) {
							break
						}

						nextPos := Position{
							Row: newPos.Row + dir.Row,
							Col: newPos.Col + dir.Col,
						}

						if g.isValidCell(nextPos) && g.Board.Cells[nextPos.Row][nextPos.Col] == Empty {
							availableMoves = append(availableMoves, nextPos)
						}

						break
					}
				}
			}
		} else {
			for _, dir := range availableDirections {
				newPos := Position{Row: pos.Row + dir.Row, Col: pos.Col + dir.Col}
				availableMoves = append(availableMoves, newPos)
			}
		}
	}

	return availableMoves
}

func (g *Game) getAvailableDirections(pos Position) []Position {
	directions := []Position{TopLeft, TopRight, BottomLeft, BottomRight}
	var availableDirections []Position

	for _, dir := range directions {
		newPos := Position{Row: pos.Row + dir.Row, Col: pos.Col + dir.Col}
		if g.isValidCell(newPos) {
			availableDirections = append(availableDirections, dir)
		}
	}

	return availableDirections
}

func (g *Game) getCaptureMoves(pos Position, directions []Position) []Position {
	var captureMoves []Position
	piece := g.Board.Cells[pos.Row][pos.Col]

	for _, dir := range directions {
		if piece == WhiteKing || piece == BlackKing {
			for step := 1; ; step++ {
				cell := Position{
					Row: pos.Row + step*dir.Row,
					Col: pos.Col + step*dir.Col,
				}
				nextCell := Position{
					Row: cell.Row + dir.Row,
					Col: cell.Col + dir.Col,
				}

				if !g.isValidCell(cell) {
					break
				}

				if g.Board.Cells[cell.Row][cell.Col] == Empty {
					continue
				}

				if (piece == WhiteKing && (g.Board.Cells[cell.Row][cell.Col] == WhitePawn || g.Board.Cells[cell.Row][cell.Col] == WhiteKing)) ||
					(piece == BlackKing && (g.Board.Cells[cell.Row][cell.Col] == BlackPawn || g.Board.Cells[cell.Row][cell.Col] == BlackKing)) {
					break
				}

				if g.isValidCell(nextCell) && g.Board.Cells[nextCell.Row][nextCell.Col] == Empty {
					captureMoves = append(captureMoves, nextCell)
					for k := 2; ; k++ {
						followingCell := Position{
							Row: nextCell.Row + dir.Row*k,
							Col: nextCell.Col + dir.Col*k,
						}
						if !g.isValidCell(followingCell) || g.Board.Cells[followingCell.Row][followingCell.Col] != Empty {
							break
						}
						captureMoves = append(captureMoves, followingCell)
					}
				}
				break
			}
		} else {
			cell := Position{Row: pos.Row + dir.Row, Col: pos.Col + dir.Col}
			nextCell := Position{Row: pos.Row + 2*dir.Row, Col: pos.Col + 2*dir.Col}
			if g.isValidCell(cell) && g.isValidCell(nextCell) && g.Board.Cells[nextCell.Row][nextCell.Col] == Empty {
				if g.CurrentTurn == WhitePawn {
					if g.Board.Cells[cell.Row][cell.Col] == BlackPawn || g.Board.Cells[cell.Row][cell.Col] == BlackKing {
						captureMoves = append(captureMoves, nextCell)
					}
				} else {
					if g.Board.Cells[cell.Row][cell.Col] == WhitePawn || g.Board.Cells[cell.Row][cell.Col] == WhiteKing {
						captureMoves = append(captureMoves, nextCell)
					}
				}
			}
		}
	}

	return captureMoves
}
