package main

const (
	errCreateRequest  = "failed to create HTTP request: %s"
	errEmptyReq       = "request data can't be empty"
	errLoadConfig     = "failed to load teler-waf config: %s"
	errNoBody         = "nobody"
	errOnlyPOSTMethod = "only POST requests are allowed."
	errParseJSON      = "failed to parse JSON data: %s"
	errReadReq        = "failed to read request: %s"
	errReadReqBody    = "failed to read request body: %s"
)
