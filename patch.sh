#!/usr/bin/env bash

source ./env.sh

echo "devfest-toolkit patch --eventId=$EVENT_ID --apiKey=***"
./bin/run patch --eventId=$EVENT_ID --apiKey=$API_KEY --siteDir=$SITE_DIR
