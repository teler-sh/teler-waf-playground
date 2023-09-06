TELER_WAF_VERSION := $(shell go list -m -f '{{ .Version }}' github.com/kitabisa/teler-waf)

build:
	go build -ldflags "-s -w -X 'main.telerWAFVersion=$(TELER_WAF_VERSION)'" -o playground .