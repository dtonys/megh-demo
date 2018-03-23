#!/bin/sh
git pull origin master
yarn
npm run build
pm2 restart all
