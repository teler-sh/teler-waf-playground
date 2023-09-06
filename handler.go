package main

import (
	"bufio"
	"fmt"
	"io"
	"strings"

	"encoding/json"
	"html/template"
	"net/http"
	"net/http/httptest"

	"github.com/kitabisa/teler-waf"
	"github.com/kitabisa/teler-waf/option"
)

func indexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("www/index.html")
	if err != nil {
		handleError(w, http.StatusInternalServerError, err.Error())
		return
	}

	err = tmpl.Execute(w, meta)
	if err != nil {
		handleError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func playHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		handleError(w, http.StatusMethodNotAllowed, errOnlyPOSTMethod)
		return
	}

	if r.ContentLength == 0 {
		handleError(w, http.StatusBadRequest, errNoBody)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		handleError(w, http.StatusBadRequest, fmt.Sprintf(errReadReqBody, err.Error()))
		return
	}

	data := new(data)
	if err := json.Unmarshal(body, &data); err != nil {
		handleError(w, http.StatusBadRequest, fmt.Sprintf(errParseJSON, err.Error()))
		return
	}

	if data.Request == "" {
		handleError(w, http.StatusBadRequest, errEmptyReq)
		return
	}

	req, err := http.ReadRequest(bufio.NewReader(strings.NewReader(data.Request)))
	if err != nil {
		handleError(w, http.StatusBadRequest, fmt.Sprintf(errReadReq, err.Error()))
		return
	}

	res := httptest.NewRecorder()

	opt, err := option.LoadFromYAMLString(data.Config)
	if err != nil {
		handleError(w, http.StatusBadRequest, fmt.Sprintf(errLoadConfig, err.Error()))
		return
	}
	opt = setDefaultOpts(opt)

	out := map[string]any{
		"ok":      false,
		"message": nil,
		"error":   nil,
	}

	waf := teler.New(opt)
	err = waf.Analyze(res, req)
	if err != nil {
		w.WriteHeader(http.StatusForbidden)
		out["message"] = err.Error()
		_ = json.NewEncoder(w).Encode(out)
		return
	}

	w.WriteHeader(http.StatusOK)
	out["ok"] = true
	_ = json.NewEncoder(w).Encode(out)
}
