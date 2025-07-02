# migrate-scss-to-css.sh
# Usage: bash migrate-scss-to-css.sh

# 1. Rename all .scss files to .css
find src -type f -name "*.scss" | while read file; do
  git mv "$file" "${file%.scss}.css"
done

# 2. Update all component TypeScript files to reference .css instead of .scss
find src -type f -name "*.ts" | while read file; do
  sed -i 's/\.scss"/.css"/g' "$file"
  sed -i "s/\.scss'/.css'/g" "$file"
done

# 3. Update angular.json to reference styles.css instead of styles.scss
sed -i 's/styles\.scss/styles.css/g' angular.json

# 4. Print a reminder for manual SCSS-to-CSS conversion
echo "---------------------------------------------"
echo "All .scss files have been renamed to .css and references updated."
echo "Now you must manually convert any SCSS syntax (nesting, variables, mixins, etc.) to valid CSS."
echo "SCSS features are NOT supported in plain CSS."
echo "---------------------------------------------"