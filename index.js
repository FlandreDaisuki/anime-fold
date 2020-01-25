#!/usr/bin/env node

/* eslint-disable no-process-exit */

const pkg = require('./package.json');
const path = require('path');
const { execSync } = require('child_process');
const { findBestMatch } = require('string-similarity');
const fs = require('fs-extra');

// argv processing //

const HELP_MESSAGE = `
Usage: ${Object.keys(pkg.bin)[0]} [-hvVx] [-k Number]

${pkg.description}

-h, --help   : Show help
-v, --version: Show version
-V, --verbose: Show information for debug
-x, --remux  : Use ffmpeg remux binary to video (need ffmpeg)

-k Number    : Set MAX_TOLERATE_SIMILARITY, 0 < k < 1, default 0.65
`;
if (process.argv.some((arg) => arg === '--help' || arg.match(/-\w*h\w*/))) {
  console.log(HELP_MESSAGE);
  process.exit();
}

if (process.argv.some((arg) => arg === '--version' || arg.match(/-\w*v\w*/))) {
  console.log(pkg.version);
  process.exit();
}

if (process.argv.some((arg) => arg === '--verbose' || arg.match(/-\w*V\w*/))) {
  process.env.ANIME_FOLD_VERBOSE = true;
}

if (process.argv.some((arg) => arg === '--remux' || arg.match(/-\w*x\w*/))) {
  const stdout = execSync('command -v ffmpeg', {
    encoding: 'utf-8',
  }).trim();

  if (!stdout) {
    throw new Error('You should install ffmpeg first');
  }

  process.env.ANIME_FOLD_REMUX = true;
}

process.env.MAX_TOLERATE_SIMILARITY = 0.65;
const argKIdx = process.argv.findIndex((arg) => arg === '-k');
if (argKIdx > -1) {
  const k = parseFloat(process.argv[argKIdx + 1]);
  if (Number.isFinite(k) && k > 0 && k < 1) {
    process.env.MAX_TOLERATE_SIMILARITY = k;
  }
}

// helper functions //

const vConsole = (() => {
  const noop = () => {};
  if (process.env.ANIME_FOLD_VERBOSE) {
    return console;
  }
  return Object.fromEntries(Object.keys(console).map((k) => [k, noop]));
})();

const clamp = (v, min, max) => Math.max(Math.min(max, v), min);

const getMIME = (filePath) => {
  const cmd = `file --mime-type "${filePath}" | sed 's/.*: //'`;
  return execSync(cmd, {
    encoding: 'utf-8',
  }).trim();
};

const separateDirectoriesAndFiles = () => {
  const VALID_MIME_OF_FILES = ['application', 'video'];
  const directories = [];
  const files = [];
  const isValidMIME = (f) => VALID_MIME_OF_FILES.some((mime) => getMIME(f).includes(mime));

  const pwdFiles = fs.readdirSync(process.cwd());
  for (const fp of pwdFiles) {
    const stat = fs.statSync(fp);
    if (stat.isFile() && isValidMIME(fp)) {
      files.push(fp);
    } else if (stat.isDirectory()) {
      directories.push(fp);
    }
  }

  return { directories, files };
};

const putAnimeToExistedDirectories = () => {
  vConsole.group('\nputAnimeToExistedDirectories');
  let threshold = 1;
  do {
    vConsole.log('threshold:', threshold);

    const { directories, files } = separateDirectoriesAndFiles();
    if (!directories.length || !files.length) {
      vConsole.log('There is no directories or no files.');
      break;
    }

    let lastMaxSimilarity = 0;
    for (const f of files) {
      const { bestMatch } = findBestMatch(f, directories);

      if (bestMatch.rating >= threshold) {
        console.log(`  ${f}`);
        console.log(`→ ${bestMatch.target}`);
        console.log();
        fs.moveSync(f, `${bestMatch.target}/${f}`, {
          overwrite: true,
        });
      } else {
        lastMaxSimilarity = clamp(bestMatch.rating, lastMaxSimilarity, threshold);
      }
    }
    threshold = lastMaxSimilarity;
  } while (threshold > process.env.MAX_TOLERATE_SIMILARITY);
  vConsole.groupEnd();
};

const createDirectoryForAnime = () => {
  vConsole.group('\ncreateDirectoryForAnime');
  let threshold = 1;
  do {
    vConsole.log('threshold:', threshold);

    const { files } = separateDirectoriesAndFiles();
    if (!files.length) {
      vConsole.log('There is no files to process.');
      break;
    }
    let lastMaxSimilarity = 0;
    for (const f of files) {
      const { ratings, bestMatch } = findBestMatch(f, files);
      const goods = ratings.filter((rt) => rt.rating >= threshold);

      if (goods.length > 1) {
        const dir = path.parse(bestMatch.target).name;
        fs.ensureDirSync(dir);
        putAnimeToExistedDirectories();
        lastMaxSimilarity = threshold;
        break;
      } else if (ratings.length > 1) {
        ratings.sort((a, b) => b.rating - a.rating);
        lastMaxSimilarity = clamp(ratings[1].rating, lastMaxSimilarity, threshold);
      }
    }
    threshold = lastMaxSimilarity;
  } while (threshold > process.env.MAX_TOLERATE_SIMILARITY);
  vConsole.groupEnd();
};

// entry //

vConsole.log('MAX_TOLERATE_SIMILARITY:', process.env.MAX_TOLERATE_SIMILARITY);

if (process.env.ANIME_FOLD_REMUX) {
  for (const f of separateDirectoriesAndFiles().files) {
    const MIMEString = getMIME(f);
    const tempName = `@${Date.now()}!${f}`;
    if (MIMEString === 'application/octet-stream') {
      execSync(`ffmpeg -i "${f}" -c copy "${tempName}"`);
      fs.moveSync(tempName, f, { overwrite: true });
    }
  }
}

putAnimeToExistedDirectories();
createDirectoryForAnime();
