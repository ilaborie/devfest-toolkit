#!/usr/bin/env bash

source ./env.sh

echo "devfest-toolkit --eventId=$EVENT_ID --apiKey=*** --siteDir=$SITE_DIR diff"
./bin/run --eventId=$EVENT_ID --apiKey=$API_KEY --siteDir=$SITE_DIR diff
