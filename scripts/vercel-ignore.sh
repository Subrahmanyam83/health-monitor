#!/bin/bash
# Exit 0 = skip deployment, Exit 1 = proceed with deployment
changed=$(git diff HEAD^ HEAD --name-only)
if [ -z "$changed" ]; then
  echo "No changes detected, skipping."
  exit 0
fi
non_data=$(echo "$changed" | grep -vE 'src/app/.*(\/users\/|\/data\/)')
if [ -z "$non_data" ]; then
  echo "Only data files changed, skipping deployment."
  exit 0
fi
echo "Code changes detected:"
echo "$non_data"
exit 1
