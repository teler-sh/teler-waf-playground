TELER_WAF_VERSION := $(shell go list -m -f '{{ .Version }}' github.com/kitabisa/teler-waf)

BUILD_DATE := $(shell date '+%D %T %Z')
BUILD_COMMIT := $(shell git rev-parse --short HEAD)

build:
	go build -ldflags "-s -w -X 'main.telerWAFVersion=$(TELER_WAF_VERSION)' -X 'main.buildDate=$(BUILD_DATE)' -X 'main.buildCommit=$(BUILD_COMMIT)'" -o playground .