# Vendored third-party assets

| Library               | Version  | SRI Hash                                                                     | Source                                                                          |
| --------------------- | -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Prism (core)          | 1.29.0   | `sha384-06z5D//U/xpvxZHuUz92xBvq3DqBBFi7Up53HRrbV7Jlv7Yvh/MZ7oenfUe9iCEt` | https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js               |
| Prism (COBOL grammar) | 1.29.0   | `sha384-s4JeL+r7pYtWemgWCY7jgWCWuBQfoHt/88SwBLAitxcMkr8ji8Lp4JvZq9qCv8W6` | https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cobol.min.js |
| Prism (default theme) | 1.29.0   | `sha384-rCCjoCPCsizaAAYVoz1Q0CmCTvnctK0JkfCSjx7IIxexTBg+uCKtFYycedUjMyA2` | https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css       |
| PDF.js (main)         | 3.11.174 | `sha384-dvUYiqYx/K4rVqYb58FNo3LVW+Dd+zT7BXt3v0SZWT//NnAiU9Fv0oAhGUX8xQmX` | https://github.com/mozilla/pdf.js/releases/tag/v3.11.174                       |
| PDF.js (worker)       | 3.11.174 | `sha384-HT06bG3afohBYkfdVEl+axoqf/P8QkXwMzLZhJ9fLl1aStzTfDi3H23H9VmBfRNy` | https://github.com/mozilla/pdf.js/releases/tag/v3.11.174                       |

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
and SRI hashes in this table and in all HTML files that load these assets.

### PDF.js

1. Download the prebuilt release zip from
   https://github.com/mozilla/pdf.js/releases/tag/vNEW_VERSION
   (asset named `pdfjs-NEW_VERSION-dist.zip`).
2. Extract `build/pdf.min.js` → `pdfjs/pdf.min.js`
3. Extract `build/pdf.worker.min.js` → `pdfjs/pdf.worker.min.js`
4. Recompute SHA-384 hashes (`certutil -hashfile <file> SHA384` on Windows or `openssl dgst -sha384 -binary <file> | base64` on Unix).
5. Update the version and SRI hashes in this table and in `Resources/pdf-viewer.html`.

The versions of `pdf.min.js` and `pdf.worker.min.js` **must match** —
mixing releases will cause runtime errors.
