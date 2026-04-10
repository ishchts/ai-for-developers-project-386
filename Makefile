.DEFAULT_GOAL := help

.PHONY: help install install-root install-frontend compile mock backend frontend dev test typecheck build-backend build-frontend build test-e2e install-playwright

MOCK_HOST ?= 127.0.0.1
MOCK_PORT ?= 4010
BACKEND_HOST ?= 127.0.0.1
BACKEND_PORT ?= 8080
FRONTEND_HOST ?= 127.0.0.1
FRONTEND_PORT ?= 5173

help:
	@echo "Available targets:"
	@echo "  make install           - install root and frontend dependencies"
	@echo "  make install-root      - install root dependencies"
	@echo "  make install-frontend  - install frontend dependencies"
	@echo "  make compile           - regenerate OpenAPI from TypeSpec"
	@echo "  make mock              - start Prism mock server on http://$(MOCK_HOST):$(MOCK_PORT)"
	@echo "  make backend           - start Fastify backend on http://$(BACKEND_HOST):$(BACKEND_PORT)"
	@echo "  make frontend          - start frontend dev server on http://$(FRONTEND_HOST):$(FRONTEND_PORT)"
	@echo "  make dev               - print commands for running backend and frontend in separate terminals"
	@echo "  make test              - run backend test suite"
	@echo "  make test-e2e          - run Playwright end-to-end suite"
	@echo "  make typecheck         - run TypeScript checks for backend"
	@echo "  make install-playwright - install Playwright browsers"
	@echo "  make build-backend     - compile backend TypeScript to dist/"
	@echo "  make build-frontend    - build frontend production bundle"
	@echo "  make build             - build backend and frontend"
	@echo ""
	@echo "Overrides:"
	@echo "  make mock MOCK_PORT=4011"
	@echo "  make backend BACKEND_PORT=8081"
	@echo "  make frontend FRONTEND_PORT=5174"
	@echo "  make frontend BACKEND_PORT=8081"

install: install-root install-frontend

install-root:
	npm install

install-frontend:
	npm install --prefix frontend

compile:
	npm run typespec:compile

mock:
	npm run prism:mock -- --host $(MOCK_HOST) --port $(MOCK_PORT)

backend:
	PORT=$(BACKEND_PORT) HOST=$(BACKEND_HOST) npm start

frontend:
	VITE_API_PROXY_TARGET=http://$(BACKEND_HOST):$(BACKEND_PORT) npm run dev --prefix frontend -- --host $(FRONTEND_HOST) --port $(FRONTEND_PORT)

dev:
	@echo "Run in terminal 1: make backend"
	@echo "Run in terminal 2: make frontend"
	@echo ""
	@echo "If 8080 is busy, use:"
	@echo "  make backend BACKEND_PORT=8081"
	@echo "  make frontend BACKEND_PORT=8081"

build:
	npm run frontend:build

test:
	npm test

test-e2e:
	npm run test:e2e

typecheck:
	npm run typecheck

install-playwright:
	npm run playwright:install

build-backend:
	npm run build:backend

build-frontend:
	npm run frontend:build

build: build-backend build-frontend
