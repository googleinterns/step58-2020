#!/usr/bin/env bash
# cd $HOME/project
gcloud config set project cloud-ad-step-2020
gcloud beta emulators datastore start --no-store-on-disk --consistency=1 &
sleep 5s
# $(gcloud beta emulators datastore env-init)
# npm start &
# sleep 5s
# npm test