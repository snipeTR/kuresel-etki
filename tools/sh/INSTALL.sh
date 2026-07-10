#!/usr/bin/env bash
# Lowercase alias for INSTALL.sh
exec bash "$(cd "$(dirname "$0")" && pwd)/INSTALL.sh" "$@"
