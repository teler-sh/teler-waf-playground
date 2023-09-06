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

    meta = map[string]interface{}{
        "Version":     telerWAFVersion,
        "BuildDate":   buildDate,
        "BuildCommit": buildCommit,
    }
}

func main() {
    http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("www/assets/"))))
    http.HandleFunc("/", indexHandler)
    http.HandleFunc("/api/play", playHandler)

    log.Printf("teler-waf-playground %s (date: %s)\n", buildCommit, buildDate)
    log.Printf("teler-waf version %s\n", telerWAFVersion)
    log.Printf("Server started on http://%s\n", hostPort)
    if err := http.ListenAndServe(hostPort, nil); err != nil {
        log.Fatal(err)
    }
}
