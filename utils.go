package main

import (
	"encoding/json"
	"net/http"

	"github.com/teler-sh/teler-waf"
)

func handleError(w http.ResponseWriter, status int, message string) {
	w.WriteHeader(status)
	out := map[string]any{
		"ok":      false,
		"message": nil,
		"error":   message,
	}

	_ = json.NewEncoder(w).Encode(out)
}

func setDefaultOpts(opt teler.Options) teler.Options {
	opt.CustomsFromFile = ""
	opt.LogFile = ""
	opt.NoStderr = true
	opt.NoUpdateCheck = false
	opt.Development = false
	opt.InMemory = false
	opt.FalcoSidekickURL = ""

	return opt
}
