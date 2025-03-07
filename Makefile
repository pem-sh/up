run:
	pnpm run dev --filter=@up/www

test:
	pnpm test

dev.db.up:
	docker run --rm --publish 5432:5432 --name=up -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=up -d postgres
	@echo "Waiting 10 seconds for database to start..."
	@sleep 10
	psql -h localhost -U postgres -d up -p 5432 -f packages/db/psql/schema.sql
# psql -h localhost -U postgres -d up -p 5432 -f data.sql

dev.db.down:
	-docker stop up
	-docker rm up


docker:
	docker build -t pem-sh/up-www:latest -f apps/web/Dockerfile .
	docker push pem-sh/up-www:latest
