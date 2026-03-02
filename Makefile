run:
		rm -rf logs
		export COMMIT_HASH=$(git rev-parse HEAD) && docker-compose up --build
