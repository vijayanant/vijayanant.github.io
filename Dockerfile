# Use a lightweight Alpine Linux image
FROM alpine:latest

# Install Hugo
RUN apk add --no-cache hugo

# Set the working directory
WORKDIR /src

# Copy site configuration and theme files that change less frequently
COPY config.toml CNAME Makefile hugo-site-requirements.md ./ 
COPY archetypes/ archetypes/
COPY layouts/ layouts/
COPY static/ static/
COPY data/ data/

# Copy content last, as it changes most frequently
COPY content/ content/
COPY assets/ assets/

# Build the Hugo site
CMD ["hugo"]