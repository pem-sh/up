run:
	pnpm run dev --filter=web

test:
	pnpm test

dev.db.up:
	docker run --rm --publish 5432:5432 --name=uppemsh -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=uppemsh -d postgres
	@echo "Waiting 10 seconds for database to start..."
	@sleep 10
	psql -h localhost -U postgres -d uppemsh -p 5432 -f packages/db/psql/schema.sql
# psql -h localhost -U postgres -d uppemsh -p 5432 -f data.sql

dev.db.down:
	-docker stop uppemsh
	-docker rm uppemsh