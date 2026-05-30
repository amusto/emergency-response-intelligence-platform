# Emergency Response Intelligence Platform — convenience commands.
#
# `make demo` brings up the shareable stack (PostGIS + API + web) without
# Valhalla, so you skip its slow first-run tile build. Routing falls back to a
# labeled straight-line estimate until you start Valhalla with `make demo-full`.

COMPOSE := docker compose

.DEFAULT_GOAL := help

.PHONY: help demo demo-full dev-db down clean logs build

help: ## Show available commands
	@echo "ERIP — available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-12s %s\n", $$1, $$2}'

demo: ## Build + run the shareable stack (db + api + web), no Valhalla
	@echo "Starting ERIP demo…"
	@echo "  Web:        http://localhost:8080/command"
	@echo "  API health: http://localhost:3000/api/health"
	@echo "  (routing uses straight-line estimate; run 'make demo-full' for Valhalla)"
	$(COMPOSE) up --build db api web

demo-full: ## Run the full stack including the Valhalla routing engine (slow first build)
	@echo "Starting full ERIP stack (Valhalla builds tiles on first run — be patient)…"
	$(COMPOSE) up --build

dev-db: ## Start only PostGIS (for local `npm run dev:api` / `dev:web`)
	$(COMPOSE) up -d db
	@echo "PostGIS up on localhost:5432 (erip/erip). Now run: npm run dev:api / npm run dev:web"

logs: ## Tail logs for the running stack
	$(COMPOSE) logs -f

down: ## Stop the stack (keeps the database volume)
	$(COMPOSE) down

clean: ## Stop the stack and delete volumes (resets the database + Valhalla tiles)
	$(COMPOSE) down -v

build: ## Build all images without starting them
	$(COMPOSE) build
