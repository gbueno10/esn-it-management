#!/bin/sh
export PATH="/usr/local/bin:$PATH"
exec node node_modules/.bin/next dev "$@"
