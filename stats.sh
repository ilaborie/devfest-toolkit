#!/usr/bin/env bash

source ./env.sh

echo "devfest-toolkit stats --eventId=$EVENT_ID --apiKey=*** --siteDir=$SITE_DIR"
./bin/run stats --eventId=$EVENT_ID --apiKey=$API_KEY --siteDir=$SITE_DIR
