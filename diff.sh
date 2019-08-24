#!/usr/bin/env bash

source ./env.sh

echo "devfest-toolkit diff --eventId=$EVENT_ID --apiKey=*** --siteDir=$SITE_DIR"
./bin/run diff --eventId=$EVENT_ID --apiKey=$API_KEY --siteDir=$SITE_DIR
