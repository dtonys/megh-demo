#!/bin/sh
git pull origin master
yarn
npm run build
npm run start
