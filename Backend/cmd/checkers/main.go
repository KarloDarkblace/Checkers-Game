package main

import (
	"checkers-backend/config"
	"checkers-backend/internal/handlers"
	"checkers-backend/internal/repository"
	"fmt"
	"github.com/go-chi/cors"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	logger := setupLogger()

	roomRepo := repository.NewRoomRepository()
	roomHandler := &handlers.RoomHandler{Repo: roomRepo}

	r := setupRouter(logger, roomHandler)

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	serverAddress := fmt.Sprintf("%s:%s", config.ServerAddress, config.ServerPort)

	go func() {
		if err := http.ListenAndServe(serverAddress, r); err != nil {
			logger.Error("Failed to start server", slog.String("error", err.Error()))
		}
	}()

	logger.Info("Server started", slog.String("address", serverAddress))

	<-done
	logger.Info("Server stopped")
}

func setupLogger() *slog.Logger {
	var logger *slog.Logger
	logFile := createLogFile()

	logger = slog.New(slog.NewJSONHandler(io.MultiWriter(os.Stdout, logFile), &slog.HandlerOptions{Level: slog.LevelInfo}))

	return logger
}

func createLogFile() *os.File {
	if err := os.MkdirAll("logs", os.ModePerm); err != nil {
		panic("Failed to create log directory: " + err.Error())
	}

	logFilePath := "logs/" + "logfile_" + time.Now().Format("02-01-2006_15-04-05") + ".log"

	logFile, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		panic("Failed to open log file: " + err.Error())
	}

	return logFile
}

func setupRouter(logger *slog.Logger, roomHandler *handlers.RoomHandler) http.Handler {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/ws/checkers", roomHandler.ServeWs)

	return r
}
