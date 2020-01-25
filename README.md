# anime-fold

📁 Create folders and put anime into the folder with similar name

## Installation

```shell
$ git clone https://github.com/FlandreDaisuki/anime-fold.git
$ cd anime-fold
$ npm i -g .
```

## Usage

```shell
$ anime-fold -h

Usage: anime-fold [-hvVx] [-k Number]

Create folders and put anime into the folder with similar name

-h, --help   : Show help
-v, --version: Show version
-V, --verbose: Show information for debug
-x, --remux  : Use ffmpeg remux binary to video (need ffmpeg)

-k Number    : Set MAX_TOLERATE_SIMILARITY, 0 < k < 1, default 0.65
```

## Example

### Before

```txt
Anime/
├── [Nekomoe kissaten][Koisuru Asteroid][01][1080p][JPTC].mp4
├── [Nekomoe kissaten][Koisuru Asteroid][02][1080p][JPTC].mp4
├── [Nekomoe kissaten][Koisuru Asteroid][03][1080p][JPTC].mp4
├── [Sakurato.sub][Darwin's Game][01][BIG5][1080].mp4
├── [Sakurato.sub][Darwin's Game][02][BIG5][1080].mp4
├── [Sakurato.sub][Overflow][01][BIG5][HEVC-10Bit][1080P].mp4
├── [SweetSub&EnkanRec] Magia Record - 01 [1080P][AVC 8bit][CHT][v2].mp4
├── [SweetSub&EnkanRec] Magia Record - 02 [1080P][AVC 8bit][CHT].mp4
└── [SweetSub&EnkanRec] Magia Record - 03 [1080P][AVC 8bit][CHT].mp4
```

### After

```txt
Anime/
├── [Nekomoe kissaten][Koisuru Asteroid][01][1080p][JPTC]
│   ├── [Nekomoe kissaten][Koisuru Asteroid][01][1080p][JPTC].mp4
│   ├── [Nekomoe kissaten][Koisuru Asteroid][02][1080p][JPTC].mp4
│   └── [Nekomoe kissaten][Koisuru Asteroid][03][1080p][JPTC].mp4
├── [Sakurato.sub][Darwin's Game][01][BIG5][1080]
│   ├── [Sakurato.sub][Darwin's Game][01][BIG5][1080].mp4
│   └── [Sakurato.sub][Darwin's Game][02][BIG5][1080].mp4
├── [Sakurato.sub][Overflow][01][BIG5][HEVC-10Bit][1080P].mp4
└── [SweetSub&EnkanRec] Magia Record - 02 [1080P][AVC 8bit][CHT]
    ├── [SweetSub&EnkanRec] Magia Record - 01 [1080P][AVC 8bit][CHT][v2].mp4
    ├── [SweetSub&EnkanRec] Magia Record - 02 [1080P][AVC 8bit][CHT].mp4
    └── [SweetSub&EnkanRec] Magia Record - 03 [1080P][AVC 8bit][CHT].mp4
```
