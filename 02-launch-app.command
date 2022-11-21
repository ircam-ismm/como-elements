#!/bin/bash

# double-click
cd "$( dirname "$0" )" || (echo "no dir: ${0}"; exit 1)

sudo ENV=prod node "./.build/server/index.js"
