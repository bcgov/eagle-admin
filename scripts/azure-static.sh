#!/usr/bin/env bash
# Publishes the eagle-admin build to an Azure storage static website under `$web/admin/`
# and checks the result through the public host. Shared by the deploy-azure-* workflows.
#
#   azure-static.sh stamp <test|prod>   before `yarn build`: rewrite src/env.js for a deployed build
#   azure-static.sh verify <test|prod>  after `yarn build`: guard dist/env.js and dist/index.html
#   azure-static.sh manifest            after `verify`: record dist/ file hashes in dist.sha256
#   azure-static.sh check-manifest      after the artifact download: fail unless dist/ matches dist.sha256
#   azure-static.sh publish             needs STORAGE_ACCOUNT; enables the static website, uploads dist/
#   azure-static.sh smoke <test|prod>   needs SITE_URL, MAIN_BUNDLE, ASSET_PROBE; checks the live site
#
# Run from the repository root. `publish` and `smoke` write MAIN_BUNDLE, ASSET_PROBE and
# ENV_ETAG to $GITHUB_ENV when it is set.
set -euo pipefail

DIST='dist'
# Outside dist/ so publish never uploads it.
MANIFEST='dist.sha256'
PREFIX='admin'
NOSTORE='no-cache, no-store, must-revalidate'
NOCACHE='no-cache'
IMMUTABLE='public, max-age=31536000, immutable'

die() { echo "::error::$*" >&2; exit 1; }

target_env() {
  case "${1:-}" in
    test|prod) echo "$1" ;;
    *) die "target must be test or prod, got '${1:-}'" ;;
  esac
}

# Explicit per extension: the CLI guesses from the host's mime table, which differs by image.
content_type() {
  case "$1" in
    html) echo 'text/html; charset=utf-8' ;;
    js|mjs) echo 'text/javascript; charset=utf-8' ;;
    css) echo 'text/css; charset=utf-8' ;;
    json|map) echo 'application/json; charset=utf-8' ;;
    # tinymce skins ship TypeScript sources beside the CSS; served as text, never executed.
    txt|ts) echo 'text/plain; charset=utf-8' ;;
    xml) echo 'application/xml' ;;
    svg) echo 'image/svg+xml' ;;
    ico) echo 'image/x-icon' ;;
    png) echo 'image/png' ;;
    jpg|jpeg) echo 'image/jpeg' ;;
    gif) echo 'image/gif' ;;
    webp) echo 'image/webp' ;;
    woff) echo 'font/woff' ;;
    woff2) echo 'font/woff2' ;;
    ttf) echo 'font/ttf' ;;
    otf) echo 'font/otf' ;;
    eot) echo 'application/vnd.ms-fontobject' ;;
    *) return 1 ;;
  esac
}

# The build names bundles and CSS-referenced media `<name>-<8 base32 chars>.<ext>`. Copied
# assets (assets/, tinymce plugins/skins/models/icons) keep their names and must revalidate.
cache_class() {
  local rel=$1 ext=$2 base=${1##*/}
  case "$ext" in html|json) echo nostore; return ;; esac
  if [[ "$rel" != */* || "$rel" == media/* ]] && [[ "$base" =~ -[A-Z0-9]{8}\.[a-z0-9]+$ ]]; then
    echo immutable
  else
    echo nocache
  fi
}

cache_value() {
  case "$1" in
    immutable) echo "$IMMUTABLE" ;;
    nocache) echo "$NOCACHE" ;;
    nostore) echo "$NOSTORE" ;;
  esac
}

export_env() {
  echo "$1=$2"
  if [ -n "${GITHUB_ENV:-}" ]; then echo "$1=$2" >> "$GITHUB_ENV"; fi
}

stamp() {
  local env_name
  env_name=$(target_env "${1:-}")
  # Turn on /api/config; other values come from it at boot, except ENVIRONMENT below.
  sed -i 's/window.__env.configEndpoint = false/window.__env.configEndpoint = true/' src/env.js
  # Read before /api/config answers, so the baked value must not say 'dev'.
  sed -i "s/window.__env.ENVIRONMENT = '[a-z]*';/window.__env.ENVIRONMENT = '$env_name';/" src/env.js
  grep -n 'window.__env' src/env.js
}

verify() {
  local env_name main expected
  env_name=$(target_env "${1:-}")
  [ -f "$DIST/index.html" ] || die "$DIST/index.html missing: run yarn build first"
  # `sed` exits 0 on no match, and env.js could drop out of the assets list.
  for expected in \
    "window.__env.configEndpoint = true;" \
    "window.__env.ENVIRONMENT = '$env_name';" \
    "window.__env.KEYCLOAK_CLIENT_ID = 'eagle-admin-console';"; do
    grep -qF "$expected" "$DIST/env.js" || die "$DIST/env.js does not hold: $expected"
  done
  grep -qF '<base href="/admin/">' "$DIST/index.html" \
    || die "$DIST/index.html does not set <base href=\"/admin/\">"
  main=$(find "$DIST" -maxdepth 1 -name 'main-*.js' -printf '%f\n' -quit)
  [ -n "$main" ] || die "the build emitted no main-*.js bundle"
  grep -qF "$main" "$DIST/index.html" || die "index.html does not reference $main"
  echo "build ok: $main, env.js stamped for $env_name"
}

list_dist() {
  (cd "$DIST" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 -r sha256sum)
}

manifest() {
  [ -f "$DIST/index.html" ] || die "$DIST/index.html missing: run yarn build first"
  list_dist > "$MANIFEST"
  echo "recorded $(wc -l < "$MANIFEST") files in $MANIFEST"
}

check_manifest() {
  [ -f "$MANIFEST" ] || die "$MANIFEST missing: the build artifact is incomplete"
  list_dist | diff -u "$MANIFEST" - || die "$DIST differs from the file list the build job recorded"
  echo "$DIST matches $MANIFEST ($(wc -l < "$MANIFEST") files)"
}

enable_static_website() {
  local current
  # `update` keeps a 404 document it is not given, and one would answer a missing asset with
  # index.html. Refuse rather than clear it: another site may rely on it.
  current=$(az storage blob service-properties show --account-name "$STORAGE_ACCOUNT" \
    --auth-mode login --query 'staticWebsite.errorDocument_404Path' -o tsv)
  [ -z "$current" ] \
    || die "$STORAGE_ACCOUNT has 404 document '$current'; eagle-admin needs none, so a missing asset returns 404. Is the account shared with another site?"
  az storage blob service-properties update --account-name "$STORAGE_ACCOUNT" \
    --auth-mode login --static-website --index-document index.html --output none
  echo "static website enabled on $STORAGE_ACCOUNT, no 404 document"
}

assert_blob() {
  local name=$1 want_cc=$2 want_type=$3 got
  got=$(az storage blob show --account-name "$STORAGE_ACCOUNT" --auth-mode login -c '$web' \
    -n "$PREFIX/$name" --query '[properties.contentSettings.cacheControl, properties.contentSettings.contentType]' -o tsv \
    | paste -sd '|')
  [ "$got" = "$want_cc|$want_type" ] \
    || die "$PREFIX/$name at the origin has '$got', expected '$want_cc|$want_type'"
  printf '  %-52s %s\n' "$PREFIX/$name" "$got"
}

publish() {
  : "${STORAGE_ACCOUNT:?STORAGE_ACCOUNT is not set}"
  if [ ! -f "$DIST/index.html" ] || [ ! -f "$DIST/env.js" ]; then die "$DIST is not a complete build"; fi

  enable_static_website

  local rel base ext class probe main etag dir
  stage=$(mktemp -d)
  trap 'rm -rf "$stage"' EXIT

  # One staging tree per cache class and extension, so each upload-batch call sets one
  # Cache-Control and one Content-Type.
  while IFS= read -r -d '' rel; do
    rel=${rel#./}
    [ "$rel" = env.js ] && continue
    base=${rel##*/}
    [[ "$base" == *.* ]] || die "$rel has no extension, so no content type rule matches it"
    ext=${base##*.}
    ext=${ext,,}
    content_type "$ext" >/dev/null || die "no content type for .$ext ($rel): add it to content_type in $0"
    class=$(cache_class "$rel" "$ext")
    mkdir -p "$stage/$class/$ext/$(dirname "$rel")"
    cp "$DIST/$rel" "$stage/$class/$ext/$rel"
  done < <(cd "$DIST" && find . -type f -print0)

  # Hashed files first and html last, so a new index.html never points at a missing bundle.
  for class in immutable nocache nostore; do
    [ -d "$stage/$class" ] || continue
    for dir in "$stage/$class"/*/; do
      ext=$(basename "$dir")
      echo "upload $class .$ext ($(find "$dir" -type f | wc -l) files)"
      az storage blob upload-batch --account-name "$STORAGE_ACCOUNT" --auth-mode login \
        -d '$web' -s "$dir" --destination-path "$PREFIX" --overwrite \
        --content-cache-control "$(cache_value "$class")" \
        --content-type "$(content_type "$ext")" --output none
    done
  done

  # Last and alone: a stale env.js boots the app against the wrong config.
  az storage blob upload --account-name "$STORAGE_ACCOUNT" --auth-mode login \
    -c '$web' -n "$PREFIX/env.js" -f "$DIST/env.js" --overwrite \
    --content-cache-control "$NOSTORE" --content-type "$(content_type js)" --output none

  # upload-batch can exit 0 with a file missing, so read one blob per rule back from the origin.
  main=$(find "$DIST" -maxdepth 1 -name 'main-*.js' -printf '%f\n' -quit)
  [ -n "$main" ] || die "the build emitted no main-*.js bundle"
  probe=$({ find "$stage/nocache/js" "$stage/nocache/css" -type f 2>/dev/null || true; } | sort | head -n 1)
  [ -n "$probe" ] || die "no unhashed .js or .css in the build to probe for no-cache"
  probe=${probe#"$stage"/nocache/*/}
  echo "origin check:"
  assert_blob index.html "$NOSTORE" "$(content_type html)"
  assert_blob env.js "$NOSTORE" "$(content_type js)"
  assert_blob "$main" "$IMMUTABLE" "$(content_type js)"
  assert_blob "$probe" "$NOCACHE" "$(content_type "${probe##*.}")"

  etag=$(az storage blob show --account-name "$STORAGE_ACCOUNT" --auth-mode login -c '$web' \
    -n "$PREFIX/env.js" --query 'properties.etag' -o tsv)
  export_env MAIN_BUNDLE "$main"
  export_env ASSET_PROBE "$probe"
  export_env ENV_ETAG "$etag"
  echo "published to $STORAGE_ACCOUNT/\$web/$PREFIX/"
}

smoke() {
  local env_name site attempts delay failures=0 code ctype i
  env_name=$(target_env "${1:-}")
  : "${SITE_URL:?SITE_URL is not set}" "${MAIN_BUNDLE:?MAIN_BUNDLE is not set}" "${ASSET_PROBE:?ASSET_PROBE is not set}"
  site=${SITE_URL%/}
  attempts=${SMOKE_ATTEMPTS:-20}
  delay=${SMOKE_DELAY:-15}
  tmp=$(mktemp -d)
  trap 'rm -rf "$tmp"' EXIT

  fail() { echo "::error::$*"; failures=$((failures + 1)); }
  # All lines of a repeated header, joined: a proxy can add its own Cache-Control line.
  header() { grep -i "^$1:" "$tmp/headers" | cut -d: -f2- | tr -d '\r' | sed 's/^ *//' | paste -sd ',' || true; }
  fetch() {
    code=$(curl -sS --max-time 20 -o "$tmp/body" -D "$tmp/headers" -w '%{http_code}' "$site$1") || code=000
    ctype=$(header content-type)
    echo "$1 -> $code ${ctype:-no content-type}, cache-control: $(header cache-control)"
  }
  body_has() { grep -qF "$1" "$tmp/body"; }
  # Weak and strong forms of the same tag compare equal; the edge may add W/ when it compresses.
  bare_etag() { echo "$1" | sed -e 's|^W/||' -e 's|"||g'; }

  # Wait for THIS build: the previous one passes every check below.
  for i in $(seq 1 "$attempts"); do
    fetch /admin/
    if [ "$code" = 200 ] && body_has "$MAIN_BUNDLE"; then break; fi
    echo "attempt $i/$attempts: /admin/ does not serve $MAIN_BUNDLE yet"
    sleep "$delay"
  done
  [ "$code" = 200 ] || fail "/admin/ returned $code, expected 200"
  [[ "$ctype" == text/html* ]] || fail "/admin/ is '$ctype', expected text/html"
  body_has "$MAIN_BUNDLE" || fail "/admin/ does not reference $MAIN_BUNDLE, the bundle this run built"

  fetch /admin/projects
  { [ "$code" = 200 ] && [[ "$ctype" == text/html* ]] && body_has "$MAIN_BUNDLE"; } \
    || fail "/admin/projects did not return this build's index.html: the edge SPA rewrite is not working, every deep link breaks"

  fetch /admin/env.js
  [ "$code" = 200 ] || fail "/admin/env.js returned $code"
  header cache-control | grep -qi 'no-store' || fail "/admin/env.js is cacheable"
  body_has 'window.__env.configEndpoint = true;' || fail "/admin/env.js does not set configEndpoint = true"
  body_has "window.__env.ENVIRONMENT = '$env_name';" || fail "/admin/env.js is not the $env_name build"
  body_has "window.__env.KEYCLOAK_CLIENT_ID = 'eagle-admin-console';" || fail "/admin/env.js lost KEYCLOAK_CLIENT_ID eagle-admin-console"
  if [ -n "${ENV_ETAG:-}" ] && [ "$(bare_etag "$(header etag)")" != "$(bare_etag "$ENV_ETAG")" ]; then
    fail "/admin/env.js ETag '$(header etag)' is not the blob just uploaded ('$ENV_ETAG'): $site is not serving this storage account"
  fi

  fetch "/admin/$MAIN_BUNDLE"
  { [ "$code" = 200 ] && header cache-control | grep -qi 'immutable'; } \
    || fail "/admin/$MAIN_BUNDLE is not served immutable"

  fetch "/admin/$ASSET_PROBE"
  [ "$code" = 200 ] || fail "/admin/$ASSET_PROBE returned $code"
  if header cache-control | grep -qi 'immutable'; then
    fail "/admin/$ASSET_PROBE is not content-hashed but is cached immutable"
  fi

  fetch /admin/nope.js
  [ "$code" = 404 ] || fail "/admin/nope.js returned $code, expected 404: a missing asset must not fall back to index.html"

  fetch /admin/api/config
  if [ "$code" = 200 ] && [[ "$ctype" == text/html* ]]; then
    fail "/admin/api/config returned index.html with 200"
  fi

  fetch /api/config
  { [ "$code" = 200 ] && [[ "$ctype" == application/json* ]]; } \
    || fail "/api/config returned $code '$ctype', expected 200 JSON: the app cannot boot without it"

  [ "$failures" -eq 0 ] || die "$failures smoke check(s) failed against $site"
  echo "smoke ok: $site/admin/ serves $MAIN_BUNDLE"
}

cmd=${1:-}
shift || true
case "$cmd" in
  stamp) stamp "$@" ;;
  verify) verify "$@" ;;
  manifest) manifest ;;
  check-manifest) check_manifest ;;
  publish) publish ;;
  smoke) smoke "$@" ;;
  *) die "usage: $0 stamp|verify|smoke <test|prod>, or $0 manifest|check-manifest|publish" ;;
esac
