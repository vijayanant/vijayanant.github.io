# Use a lightweight Alpine Linux image
FROM alpine:latest

# Install Hugo
RUN apk add --no-cache hugo

# Set the working directory
WORKDIR /src

# Copy the entire project into the container
COPY . .

# Declare the BUTTONDOWN_API_KEY build-time variable


# Build the Hugo site
CMD ["hugo"]