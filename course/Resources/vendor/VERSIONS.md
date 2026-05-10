# Vendored third-party assets

| Library               | Version  | Source                                                                          |
| --------------------- | -------- | ------------------------------------------------------------------------------- |
| Prism (core)          | 1.29.0   | https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js               |
| Prism (COBOL grammar) | 1.29.0   | https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cobol.min.js |
| Prism (default theme) | 1.29.0   | https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css       |
| PDF.js (main)         | 3.11.174 | https://github.com/mozilla/pdf.js/releases/tag/v3.11.174                       |
| PDF.js (worker)       | 3.11.174 | https://github.com/mozilla/pdf.js/releases/tag/v3.11.174                       |

## Refresh procedure

### Prism

Download updated files from cdnjs (replace `1.29.0` with the new version):

```sh
curl -o prism/prism.min.js \
  https://cdnjs.cloudflare.com/ajax/libs/prism/NEW_VERSION/prism.min.js

curl -o prism/components/prism-cobol.min.js \
  https://cdnjs.cloudflare.com/ajax/libs/prism/NEW_VERSION/components/prism-cobol.min.js

curl -o prism/themes/prism.min.css \
  https://cdnjs.cloudflare.com/ajax/libs/prism/NEW_VERSION/themes/prism.min.css
```

Verify the downloaded files against the SRI hashes published on
https://cdnjs.com/libraries/prism/NEW_VERSION, then update the version
in this table.

### PDF.js

1. Download the prebuilt release zip from
   https://github.com/mozilla/pdf.js/releases/tag/vNEW_VERSION
   (asset named `pdfjs-NEW_VERSION-dist.zip`).
2. Extract `build/pdf.min.js` → `pdfjs/pdf.min.js`
3. Extract `build/pdf.worker.min.js` → `pdfjs/pdf.worker.min.js`
4. Update the version in this table.

The versions of `pdf.min.js` and `pdf.worker.min.js` **must match** —
mixing releases will cause runtime errors.
