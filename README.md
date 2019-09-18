# Devfest Toolkit

## What

Tools for working with [Confrerence Hall](https://conference-hall.io/) data, and publish these data to a Web Site

Note: It's being design to work with the [devfest-theme-hugo](https://github.com/GDGToulouse/devfest-theme-hugo).

## Usage

```bash
  $ devfest-toolkit --eventId=XXX --apiKey=XXX --siteDir=XXX diff [COMMAND]
```

## Commands

- `diff`: Compare with site from conference hall and extra data

- `generate`: Generate site from conference hall and extra data

- `add-sponsor`: Append a new sponsor to add-on

- `add-speaker`: Append a new speaker to add-on

- `add-session`: Append a new session to add-on

- `stats`: Display some stats

- `patch`: Read data from site, and create patches if necessary

## Options

- `-h`, `--help`: show CLI help
- `-v`, `--version`: show CLI version
- `--eventId=eventId`: (required) the event id in conference hall
- `--apiKey=apiKey`: (required) the conference hall api key
- `-s`, `--siteDir=siteDir`: (required) the conference hall api key
- `--addonDir=addonDir`: the add-on directory (default: `./add-on`)
- `--patchDir=patchDir`: the patch directory (default: `./patches`)
- `--force`: override file if required
- `--sponsorCategories=gold,silver,...`: define categories of sponsor, should be a coma-separated list.
- `--languages=fr,en,...`: define language of sponsor or talk, should be a coma-separated list.
