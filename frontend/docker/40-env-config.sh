#!/bin/sh
set -eu

: "${API_BASE_URL:=http://localhost:8080/api}"
: "${APP_NAME:=WebGCS03}"
: "${MAPBOX_ACCESS_TOKEN:=}"
: "${MAPBOX_STYLE_URL:=mapbox://styles/mapbox/satellite-streets-v12}"

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__APP_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL}",
  APP_NAME: "${APP_NAME}",
  MAPBOX_ACCESS_TOKEN: "${MAPBOX_ACCESS_TOKEN}",
  MAPBOX_STYLE_URL: "${MAPBOX_STYLE_URL}"
};
EOF
