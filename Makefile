test: deps
	@npm test

deps:
	@(((ls node_modules | grep .) > /dev/null 2>&1) || npm ci) || true
