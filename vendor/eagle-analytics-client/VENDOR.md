# Vendored copy

`README.md`, `package.json` and `dist/` in this directory are a copy of the release assets from
`digitalspace/eagle-analytics`. `README.md` is the upstream file, unchanged, so this note lives
beside it rather than inside it.

| | |
|---|---|
| Tag | `client-v0.1.1` |
| Tarball | `eagle-analytics-client-0.1.1.tgz` |
| sha256 | `d785a4115d2feeb420d1642e34fd6932145b37433636e801131c94595d6c6ad6` |

There is no source here, only the built output. The Development and Releases sections of `README.md`
and the `scripts` and `devDependencies` in `package.json` describe the upstream `client/` directory
and do not work in this one. Change the code upstream and vendor a new release; never edit `dist/`.

The directory is a plain path dependency, so no registry and no token are involved:

```json
"@digitalspace/eagle-analytics-client": "file:./vendor/eagle-analytics-client"
```

To take a newer version, follow the Vendoring section of the upstream `client/README.md`: download
the release assets for the new tag, check them against `SHA256SUMS`, copy `dist/`, `package.json`
and `README.md` over this directory, update the table above, and run `yarn install`.
