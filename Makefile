# Makefile for personal-website

# Variables
IMAGE_NAME = personal-website-builder

# Targets
.PHONY: all build run rebuild clean help serve

all: run

build:
	@echo "Building Docker image..."
	docker build -t $(IMAGE_NAME) .

run:
	@echo "Running build container..."
	docker run --rm -v "$(CURDIR):/src" $(IMAGE_NAME)

rebuild: 
	@echo "Rebuilding Docker image without cache..."
	docker build --no-cache -t $(IMAGE_NAME) .
	@echo "Running build container..."
	docker run --rm -v "$(CURDIR):/src" $(IMAGE_NAME)

serve:
	@echo "Starting Hugo server..."
	# docker run --rm -it -p 1313:1313 -v "$(CURDIR):/src" $(IMAGE_NAME) hugo server --bind 0.0.0.0 --baseURL=http://localhost/ --buildDrafts
	docker run --rm -it -p 1313:1313 -v "$(CURDIR):/src" $(IMAGE_NAME) hugo server --bind 0.0.0.0 --baseURL=http://localhost/

clean:
	@echo "Cleaning up..."
	rm -rf public

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build    Build the Docker image"
	@echo "  run      Run the Docker container to build assets"
	@echo "  rebuild  Rebuild the Docker image without cache and run the container"
	@echo "  serve    Start the Hugo development server"
	@echo "  clean    Remove generated files"
	@echo "  help     Show this help message"
