#!/usr/bin/env bash

source ./env.sh

echo "devfest-toolkit generate --eventId=$EVENT_ID --apiKey=*** --siteDir=$SITE_DIR --force"
./bin/run generate --eventId=$EVENT_ID --apiKey=$API_KEY --siteDir=$SITE_DIR --force
