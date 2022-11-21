#!/bin/bash

# double-click
cd "$( dirname "$0" )" || (echo "no dir: ${0}"; exit 1)

cd dns

./DNS_run.command
