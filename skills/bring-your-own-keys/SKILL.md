---
name: bring-your-own-keys
description: Use before running any of these skills for real. Nothing here stores or proxies a key. Your agent holds three of your own, an Openverse client for the free photo library, an Apify token for the paid image searches, and a key from any provider that serves Seedance 2.x with reference images, and this skill says where each is used and how each is called.
---

[← All skills](../../README.md)

# bring-your-own-keys

This repository is a direction for an agent, not a service. Nothing runs through it and nothing is stored in it. Your agent searches with your own credentials, judges the photographs with its own eyes, writes the script by the skills, and submits to the Seedance provider you already pay.

## The three keys

| Key | What it is for | Where it comes from |
| --- | --- | --- |
| **Openverse** | The free library: real, Creative Commons photographs from Flickr, Wikimedia and others. Best for plain places. It holds almost no device footage. | Register a client once: `POST https://api.openverse.org/v1/auth_tokens/register/` with a name, a description and an email. It answers with a client id and secret at once. Trade them for a bearer token at `POST /v1/auth_tokens/token/` with `grant_type=client_credentials`. Unregistered calls work too, at a low rate. |
| **Apify** | The paid searches: Google Images and Bing Images through Apify's actors. Device footage (CCTV, doorbell, dashcam, bodycam, trail cam) is found here. | Your Apify account's API token. |
| **A video API key** | Submitting the references and the script to Seedance. | Any provider that serves Seedance 2.x with reference images. |

## How each is used

The engine routes each search by what is being looked for.

1. **A plain place: Openverse, with Bing beside it.** `GET https://api.openverse.org/v1/images/?q=<the place, bare>&page_size=20&mature=false` with `Authorization: Bearer <token>`. Openverse gets the bare place ("forest", "kitchen"), never footage words: its photographs are candid by construction. Each result carries the image `url`, its `title`, `license`, `source` and `foreign_landing_url`, so the photograph and its maker can be credited. Google, through reddit, fills what they miss. The engine's own client is in this repository: `LIBRARY_EMAIL=you@example.com node library.mjs "<query>" [n]` registers a client once, keeps the token in `~/.config/library/`, and prints the results; set `LIBRARY_CLIENT_ID` and `LIBRARY_CLIENT_SECRET` instead if you already have one.
2. **Device footage: the paid routes, never the free library.** CCTV, doorbell, dashcam, bodycam and trail-cam frames are posted across the open web, not in a Creative Commons library. Google Images leads, with `site:reddit.com` added, where people post their real footage, and with the words people title it by (see [catch-it-on-a-device](../catch-it-on-a-device/SKILL.md)); Bing fills what it misses. Google: `POST https://api.apify.com/v2/acts/hooli~google-images-scraper/run-sync-get-dataset-items` with `{"queries": ["<query>"], "maxResultsPerQuery": 20}`. Bing: `POST https://api.apify.com/v2/acts/automation-lab~bing-images-scraper/run-sync-get-dataset-items` with `{"query": "<query>", "maxResults": 20}`. Both take `Authorization: Bearer <apify token>` and answer with rows that carry an `imageUrl`. If your agent can search the web itself, in a browser with your own Google, the same searches cost nothing.
3. **A broadcast, or a named fictional world: Bing first.** A show's set or a televised match has no footage people shot themselves; its frames live on the general index, while reddit holds talk about them.
4. **Judge with your own eyes.** Open the candidates and ask, in this order: a real photograph, not AI-made or stock; the right place; candid, not posed or lit for a shoot; room for the story (find-the-place-first). Keep the timestamp overlays (catch-it-on-a-device).
5. **Write the script by the skills:** the scene to the photograph, beats stamped, no camera words, at most four references (one-bag-of-four).
6. **Submit to your provider:** the script as the prompt, the references as `reference_image_urls` (or whatever your provider names them), the aspect ratio, the duration, and a resolution the model lists. Read the model's own constraint list first: a resolution or an aspect it does not list is a rejected request.

What stays with you: every key, every photograph, every video. The repository holds the method.
