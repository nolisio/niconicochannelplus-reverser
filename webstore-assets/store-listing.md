# Chrome Web Store Listing Draft

## Public Name
Stereo Swap for nicochannel.jp

## Short Description
Swaps left and right audio channels for video playback on nicochannel.jp.

## Detailed Description
Stereo Swap for nicochannel.jp swaps the left and right audio channels for video playback directly in your browser.

Use this extension when you want the stereo image reversed while watching videos on nicochannel.jp.

### What it does
- Works only on nicochannel.jp
- Swaps left and right audio channels locally in the browser
- Stores only the enabled/disabled preference in `chrome.storage.local`

### What it does not do
- Does not download, save, or redistribute audio or video
- Does not send audio, video, or personal data to external servers
- Does not work on websites other than nicochannel.jp

## Single Purpose
Swap the left and right audio channels during video playback on nicochannel.jp.

## Suggested Category
Accessibility

## Privacy & Permissions Answers
- `storage`: saves only the enabled/disabled preference locally
- Site access to `https://nicochannel.jp/*`: required to detect the page video element and apply local audio channel swapping on that site only
- Remote code: not used; all executable code is packaged within the extension

## Reviewer Notes
This extension does not download, proxy, record, upload, or share media. It uses the page's existing HTML video playback and swaps stereo channels locally with the Web Audio API.

### Reviewer Test Notes
1. Open a video page on nicochannel.jp.
2. Open the extension popup and turn the switch on.
3. If audio does not switch immediately, click once inside the video page.
4. Confirm that left and right audio playback are audibly reversed.
5. Turn the switch off and confirm normal stereo playback returns.
