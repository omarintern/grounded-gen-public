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
| **Openverse** | The free library: real, Creative Commons photographs from Flickr, Wikimedia and others. Searched first, always, with the bare name of the place. | Register a client once: `POST https://api.openverse.org/v1/auth_tokens/register/` with a name, a description and an email. It answers with a client id and secret at once. Trade them for a bearer token at `POST /v1/auth_tokens/token/` with `grant_type=client_credentials`. Unregistered calls work too, at a low rate. |
| **Apify** | The paid searches, for when the free library has no candid frame: Google Images and Bing Images through Apify's actors. | Your Apify account's API token. |
| **A video API key** | Submitting the references and the script to Seedance. | Any provider that serves Seedance 2.x with reference images. |

## How each is used

1. **Search Openverse first.** `GET https://api.openverse.org/v1/images/?q=<the place, bare>&page_size=20&mature=false` with `Authorization: Bearer <token>`. The library gets the bare place ("forest", "kitchen"), never footage words: its photographs are candid by construction. Each result carries the image `url`, its `title`, `license`, `source` and `foreign_landing_url`, so the photograph and its maker can be credited. The engine's own client is in this repository: `LIBRARY_EMAIL=you@example.com node library.mjs "<query>" [n]` registers a client once, keeps the token in `~/.config/library/`, and prints the results; set `LIBRARY_CLIENT_ID` and `LIBRARY_CLIENT_SECRET` instead if you already have one.
2. **Then the paid routes,** with the words people title their footage with (see catch-it-on-a-device). Google Images: `POST https://api.apify.com/v2/acts/hooli~google-images-scraper/run-sync-get-dataset-items` with `{"queries": ["<query>"], "maxResultsPerQuery": 20}`. Bing Images: `POST https://api.apify.com/v2/acts/automation-lab~bing-images-scraper/run-sync-get-dataset-items` with `{"query": "<query>", "maxResults": 20}`. Both take `Authorization: Bearer <apify token>` and answer with rows that carry an `imageUrl`. For footage, add `site:reddit.com` to the Google query: that is where people post their real ride, dashcam and security-camera frames.
3. **Judge with your own eyes.** Open the candidates and ask, in this order: a real photograph, not AI-made or stock; the right place; candid, not posed or lit for a shoot; room for the story (find-the-place-first). Keep the timestamp overlays (catch-it-on-a-device).
4. **Write the script by the skills:** the scene to the photograph, beats stamped, no camera words, at most four references (one-bag-of-four).
5. **Submit to your provider:** the script as the prompt, the references as `reference_image_urls` (or whatever your provider names them), the aspect ratio, the duration, and a resolution the model lists. Read the model's own constraint list first: a resolution or an aspect it does not list is a rejected request.

What stays with you: every key, every photograph, every video. The repository holds the method.
