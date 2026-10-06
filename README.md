# Everyday Cool

**Free tools for children, curious adults, and anyone who likes finding out how things work.** Curated by Steven Powell. Built with AI assistance, human curiosity, and review.

[Open Everyday Cool](https://caeled.github.io/everyday-cool/) · [Download the complete collection](https://github.com/caeled/everyday-cool/archive/refs/heads/main.zip) · [Suggest an idea](https://github.com/caeled/everyday-cool/issues/new/choose)

## A new home, with the originals preserved

The existing projects will remain at their original addresses and continue to be maintained. Everyday Cool is the curated home for the current collection and future additions. The four GitHub projects are **copied, not moved**, into `projects/`. Each keeps its licenses, credits, source files, and helpers.

These are independent source snapshots inside one collection, rather than GitHub's single-parent fork feature. Original Git histories remain in the original repositories. `catalog.json` records the exact source commits used for this first collection. Copies do not silently update each other. Changes to an original or the collection are compared, reviewed, and carried across deliberately; see [MAINTAINING.md](MAINTAINING.md).

| Project | Collection copy | Maintained original |
| --- | --- | --- |
| Nerd Heaven | [IT support workshop](projects/nerd-heaven-tech-support/index.html) | [Repository](https://github.com/caeled/nerd-heaven-tech-support) · [Website](https://caeled.neocities.org/learn/) |
| Java for Young Robot Builders | [Java robotics](projects/java-young-robot-builders/index.html) | [Repository](https://github.com/caeled/java-young-robot-builders) · [Website](https://caeled.github.io/java-young-robot-builders/) |
| Weather Everywhere | [Weather exploration](projects/weather-everywhere/index.html) | [Repository](https://github.com/caeled/weather-everywhere) · [Website](https://caeled.github.io/weather-everywhere/) |
| Secret Squares | [QR and information workshop](projects/secret-squares/index.html) | [Repository](https://github.com/caeled/secret-squares) · [Website](https://caeled.github.io/secret-squares/) |
| Space Camp / For Christa | [Space workshop and tribute](projects/space-camp/space-camp.html) | [Original website](https://caeled.neocities.org/EveryDayCool/space-camp) |

| A Library | [35-link reference shelf](projects/a-library/a-library.html) | Author-supplied shelf, maintained in this collection |

Space Camp and A Library were supplied by Steven as files on 6 October 2026. Their SHA-256 origin records and documented collection changes accompany the copies; no original Git history is claimed for those uploads.

## Take it with you

Download the collection ZIP, extract it, and open `index.html` or double-click `Launch.cmd`. The five bundled workshops include their source and offline core activities, including Space Camp and its portrait. A Library is also packaged as an offline reference shelf. Videos, external reading destinations, and live weather need internet. Some cryptography features require HTTPS or localhost: `Serve.cmd` uses an existing Python 3 installation on port 8004. Optional media helpers belong to their projects; review each project's guide before using them.

The front page works without JavaScript. With JavaScript, its search and topic filters work locally, without accounts or tracking. `downloads/` contains individual project ZIPs. Run `python tools/build-packages.py` after changes to refresh them and create a complete portable ZIP beside this folder.

## Give curiosity a place to start

Our official collection is free to access, with no subscriptions, prompt-pack sales, ads, affiliate funnels, or required paid AI accounts. Additions should teach something through exploration, explanation, or practice. We welcome corrections, translations, accessibility improvements, experiments, and new subjects.

Fork this repository to develop your own ideas. Open a pull request when you want a change considered for the official collection. Steven decides what is included; a submission is a proposal, not automatic publication. See [CONTRIBUTING.md](CONTRIBUTING.md), [GOVERNANCE.md](GOVERNANCE.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Free licenses, honest boundaries

Original hub code and tools are MIT. Original hub educational writing is CC BY 4.0. Bundled projects keep their own included licenses, including third-party notices. External resources keep their creators' terms. Preserve credit and identify changes to educational material.

MIT and CC BY 4.0 permit commercial reuse. Our free-access policy governs what **we publish in the official collection**; it does not revoke anyone's existing license rights or prohibit independent commercial forks. A fork's existence does not imply our endorsement. See [LICENSE](LICENSE), [LICENSE-CONTENT.md](LICENSE-CONTENT.md), and [THIRD-PARTY.md](THIRD-PARTY.md).

## Verify

Run `python tools/check-collection.py` to validate catalog links, bundled licenses, individual ZIP contents, and snapshot provenance. Existing workshop tests remain in their original project folders. Root checks inspect files and never execute contributed scripts. No automated publishing from pull requests is configured.
