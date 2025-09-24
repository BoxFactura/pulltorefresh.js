test: deps
ifdef GITHUB_ACTIONS
	@git config --global --add safe.directory /github/workspace
endif
	@npm test -- --colors

deps:
	@(((ls node_modules | grep .) > /dev/null 2>&1) || npm i) || true
