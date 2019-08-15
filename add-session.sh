#!/usr/bin/env bash

source ./env.sh

echo "devfest-toolkit --eventId=$EVENT_ID --apiKey=*** --siteDir=$SITE_DIR add-session"
./bin/run --eventId=$EVENT_ID --apiKey=$API_KEY --siteDir=$SITE_DIR add-session
