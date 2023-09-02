package main

import (
    "log"
    "net"
    "os"

    "net/http"
)

func init() {
    portEnv := os.Getenv("PORT")
    if portEnv != "" {
        port = portEnv
    }

    hostPort = net.JoinHostPort("0.0.0.0", port)
}

func main() {
    http.Handle("/", http.FileServer(http.Dir("www")))
    http.HandleFunc("/api/play", playHandler)

    log.Printf("Server started on http://%s\n", hostPort)
    if err := http.ListenAndServe(hostPort, nil); err != nil {
        log.Fatal(err)
    }
}
