#!/bin/bash
# filepath: ./convert-scss-vars-to-css-vars.sh

# This script converts SCSS $variables to CSS --variables in all .css files in the current directory and subdirectories.

find . -type f -name "*.css" | while read -r file; do
  echo "Processing $file"
  # Convert SCSS variable definitions like: $var-name: value;
  sed -i 's/^\s*\$\([a-zA-Z0-9_-]*\)\s*:\s*\(.*\);/--\1: \2;/' "$file"
  # Convert SCSS variable usage like: color: $var-name;
  sed -i 's/\$\([a-zA-Z0-9_-]*\)/var(--\1)/g' "$file"
done

echo "All SCSS $variables in .css files have been converted to CSS --variables."