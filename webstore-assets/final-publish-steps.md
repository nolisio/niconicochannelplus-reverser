# Final Publish Steps

The extension package and local store assets are prepared.

## 1. Support contact is configured
The privacy policy files now point to this support email address:

- `minecraftnolisio@gmail.com`

## 2. Publish the privacy policy at a public URL
Host `webstore-assets/privacy-policy.html` somewhere publicly reachable, then use that URL in the Chrome Web Store Privacy section.

Examples:

- GitHub Pages
- your own website
- a simple static hosting service

## 3. Upload the prepared screenshot asset
Use this file in the Chrome Web Store listing:

- `webstore-assets/store-screenshot.png`

Verified size: `1280x800`

## 4. Upload the extension ZIP
Use this runtime-only package for the extension upload:

- `dist/niconicochannelplus-reverser-webstore.zip`

## 5. Recommended Chrome Web Store field values
- Name: `Stereo Swap for nicochannel.jp`
- Short description: `Swaps left and right audio channels for video playback on nicochannel.jp.`
- Category: `Accessibility`

## 6. Final manual check before submission
Load the unpacked extension in Chrome once, open a real `nicochannel.jp` video page, turn the extension on, and confirm that left/right playback swaps as expected.
