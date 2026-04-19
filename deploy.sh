#!/bin/bash
set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-192.168.2.124}"
REMOTE_PORT="${REMOTE_PORT:-2222}"
REMOTE_USER="${REMOTE_USER:-cburns}"
REMOTE_DOCKER_PATH="${REMOTE_DOCKER_PATH:-/home/cburns/docker/earthco-market}"
REMOTE_ARCHIVE_PATH="${REMOTE_ARCHIVE_PATH:-/tmp/earthco-market-images.tar}"

CLIENT_IMAGE="${CLIENT_IMAGE:-ghcr.io/burnsco/earthco-market-client:latest}"
SERVER_IMAGE="${SERVER_IMAGE:-ghcr.io/burnsco/earthco-market-server:latest}"

ARCHIVE_PATH="$(mktemp -t earthco-market-images.XXXXXX.tar)"
trap 'rm -f "$ARCHIVE_PATH"' EXIT

echo "🚀 Deploying EarthCo Market..."

echo "📦 Building Client..."
docker build --network=host -f Dockerfile.client -t "$CLIENT_IMAGE" .

echo "📦 Building Server..."
docker build --network=host -f server/Dockerfile -t "$SERVER_IMAGE" .

echo "📦 Packaging images for transfer..."
docker save -o "$ARCHIVE_PATH" "$CLIENT_IMAGE" "$SERVER_IMAGE"

echo "⬆️  Copying images to mordor..."
scp -P "$REMOTE_PORT" "$ARCHIVE_PATH" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_ARCHIVE_PATH"

echo "🚢 Loading images and restarting the server stack..."
remote_cmd=$(printf 'set -euo pipefail; docker load -i %q >/dev/null; rm -f %q; cd %q && docker compose up -d --no-build' \
  "$REMOTE_ARCHIVE_PATH" \
  "$REMOTE_ARCHIVE_PATH" \
  "$REMOTE_DOCKER_PATH")
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "bash -lc $(printf '%q' "$remote_cmd")"

echo "✅ Deployment complete!"
