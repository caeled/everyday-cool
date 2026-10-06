# Optional offline recordings

The course works without downloading recordings. To add them on Windows:

1. Extract the course ZIP; do not run from inside the ZIP viewer.
2. Put the whole extracted folder on the USB or drive where recordings should stay.
3. Connect to the internet and double-click Download-Media.bat.
4. Choose videos (~3.3 GB), everything (~3.7 GB), the two-hour starter (~195 MB), or transcripts/captions (<1 MB).
5. Open index.html, then Discovery Room, then Offline recordings. Reopen the page after new downloads.

Completed files are kept. Interrupted downloads remain as .part files and can resume when the publisher supports it. Enough free space is checked first. Static video and reading files must match the original collection's SHA-256 hashes. Podcast audio may change due to advertisements; changed MP3s are identified and a warning is shown. Failed downloads do not remove successes. If a publisher stops supporting a download, use its official source link.

The helper uses Windows PowerShell and curl.exe, supplied with current Windows 10/11. Its batch file applies an execution-policy override only to that child PowerShell process; it does not change the computer's persistent policy or need administrator rights. Managed computers may prohibit scripts; in that case use the official publisher links or ask the device administrator. The HTML course works on other systems; the batch helper is Windows-only.

Sources: DeepMind's public podcast feed, MIT OCW publisher-linked Archive downloads, and ESO's film/subtitles. URLs and original hashes are recorded in offline-media-sources.json. Credits and third-party license terms are retained in the Discovery Room. Do not rehost the downloaded podcasts publicly without permission.

Browser subtitle data is generated on the learner’s device from downloaded publisher SRT files. The public ZIP contains empty subtitle placeholders, not publisher subtitle text.
