---
title: Tab Ledger
description: A Chrome extension that records every tab you close, so you can find that one page again a week later.
url: https://tabledger.example.com
repo: https://github.com/example/tab-ledger
order: 2
---

<!-- PLACEHOLDER -->

Tab Ledger started because I kept closing a tab and then spending ten minutes
digging through browser history to get it back. History is a bad tool for this:
it records everything you visit, not the small set of pages you actually cared
about long enough to keep open.

The extension writes a local entry each time a tab closes — title, URL, the
window it belonged to, and how long it had been open. Nothing leaves the
machine. There is no account, no sync, and no server, which also means there is
nothing to pay for and nothing to breach.

The search is deliberately dumb: a substring match over titles and URLs,
ordered by how long the tab stayed open. Time-on-page turned out to be a better
relevance signal than recency. A tab you kept for three days is almost always
the one you are looking for.
