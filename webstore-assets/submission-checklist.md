# Chrome Web Store Submission Checklist

## Public Claims To Verify
- "Works only on nicochannel.jp" -> verify `content_scripts.matches` is limited to `https://nicochannel.jp/*`
- "Stores only the enabled/disabled preference" -> verify only the boolean preference is written to `chrome.storage.local`
- "Processes audio locally" -> verify the extension does not upload audio, video, or user data
- "Does not download, save, or redistribute media" -> verify there is no download, export, or media upload flow in the extension
- "Swaps left and right audio channels" -> manually test one nicochannel.jp video with the feature on and off

## Chrome Web Store Privacy Practice Notes
Use wording equivalent to:

> The extension stores only a local enabled/disabled preference. It does not transfer personal data, media, or browsing activity to the developer or third parties.

## Prepared Local Assets
- Store screenshot source: `webstore-assets/store-screenshot.html`
- Store screenshot image: `webstore-assets/store-screenshot.png`
- Privacy policy source: `webstore-assets/privacy-policy.html`

## Remaining External Submission Items
- A public URL for `privacy-policy.html` or equivalent published privacy policy page
