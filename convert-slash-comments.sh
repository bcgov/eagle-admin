#!/bin/bash
# filepath: ./convert-slash-comments.sh

# This script converts all // comments to /* */ comments in all .css files in the current directory and subdirectories.

find . -type f -name "*.css" | while read -r file; do
  echo "Processing $file"
  # Replace // comments at the start of a line or after code with /* ... */
  sed -i 's|//\(.*\)|/*\1 */|g' "$file"
done

echo "All // comments in .css files have been converted to /* */ comments."