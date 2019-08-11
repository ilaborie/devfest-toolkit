# Devfest Toolkit

## What

Tools for working with [Confrerence Hall](https://conference-hall.io/) data, and publish these data to a Web Site or Konfetti) data, and publish these data to a Web Site

## Usage

```bash
  $ devfest-toolkit --eventId=XXX --apiKey=XXX --siteDir=XXX diff [COMMAND]
```

## Commands

- `diff`: Compare with site from conference hall and extra data

- `generate`: Generate site from conference hall and extra data

- `stats`: Display some stats

## Options

- `-h`, `--help`: show CLI help
- `-v`, `--version`: show CLI version
- `--eventId=eventId`: (required) the event id in conference hall
- `--apiKey=apiKey`: (required) the conference hall api key
- `-s`, `--siteDir=siteDir`: (required) the conference hall api key
- `--addonDir=addonDir`: the add-on directory (default: `./add-on`)
- `--patchDir=patchDir`: the patch directory (default: `./patches`)
- `--force`: override file if required
