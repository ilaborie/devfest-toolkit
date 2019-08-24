#!/usr/bin/env bash

source ./env.sh

echo "devfest-toolkit add-session --eventId=$EVENT_ID --apiKey=*** --siteDir=$SITE_DIR"
./bin/run add-session --eventId=$EVENT_ID --apiKey=$API_KEY --siteDir=$SITE_DIR
