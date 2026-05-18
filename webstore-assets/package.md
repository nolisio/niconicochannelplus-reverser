# Web Store Packaging Notes

This extension should be packaged with runtime files only.

## Include
- `manifest.json`
- `popup.html`
- `popup.js`
- `content.js`
- `icons/icon16.png`
- `icons/icon32.png`
- `icons/icon48.png`
- `icons/icon128.png`

## Exclude
- `webstore-assets/`
- `tools/`
- `dist/`
- `.git/`
- `.DS_Store`
- any other development-only files

## Example Packaging Command
Run from the extension root:

```bash
zip -r "dist/niconicochannelplus-reverser-webstore.zip" manifest.json popup.html popup.js content.js icons
```

## Verification
After packaging, confirm that:

- `manifest.json` is at the ZIP root
- `webstore-assets/` is not in the archive
- `tools/` is not in the archive
- only runtime files required by the extension are included
