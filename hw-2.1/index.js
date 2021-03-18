const fs = require('fs');
const path = require('path');
const args = require('commander');

args
  .option('-i, --start [start]', 'Start folder', './start')
  .option('-f, --finish [finish]', 'Finish folder', './finish')
  .option('-d, --delete', 'Delete start folder')
  .parse(process.argv);

const options = args.opts();
const startDir = options.start;
const finishDir = options.finish;

sortFiles(startDir, finishDir).then(() => {
  console.log('DONE!');
}).catch(err => {
  console.log(err);
});

function sortFiles (startDir, finishDir) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        await checkAccess(startDir);
      } catch (err) {
        console.log('Start folder does not exist');
        resolve(false);
      }

      try {
        await checkAccess(finishDir);
        await createDir(finishDir);
      } catch (err) {}

      try {
        await sortDir(startDir);
      } catch (err) {}

      resolve(true);
    })();
  });
}

function checkAccess (path) {
  return new Promise((resolve, reject) => {
    fs.access(path, err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function createDir (path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function readDir (path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function getStat (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, state) => {
      if (err) {
        reject(err);
      } else {
        resolve(state);
      }
    });
  });
}
// 2 If max
const sortDir = async (dir) => {
  const detectedFiles = [];

  async function readdir(dir) {
    const files = await readDir(dir)

    for (let item = 0; item< files.length; item++) {
      const itemPath = path.join(dir, files[item]);
      const stats = await getStat(itemPath);

      if (stats.isDirectory()) {
        await readdir(dir)
      } else {
        const letter = files[item][0].toUpperCase();
        const targetDir = path.join(finishDir, letter);
        const targetFile = path.join(targetDir, files[item]);
        const checkedAccess = await checkAccess(targetDir)

        if (checkedAccess) {
          detectedFiles.push(moveFile(item, itemPath, targetFile, targetDir, dir))
        } else {
          await createDir(targetDir)
          detectedFiles.push(moveFile(item, itemPath, targetFile, targetDir, dir))
        }
      }
    }
  }
  try {
    await readdir(dir)

    Promise.all(detectedFiles).then(() => {
      console.log('sorting complete')
    })
  } catch (err) {
    console.error(err)
  }
}

function moveFile (item, itemPath, targetFile, targetDir, dir) {
  return new Promise((resolve, reject) => {
    let fileNameSuffix = 1;
//EXIST
    while (fs.existsSync(targetFile)) {
      const itemParts = path.parse(item);
      targetFile = path.join(targetDir, itemParts.name + '_' + fileNameSuffix + itemParts.ext);
      fileNameSuffix++;
    }

    fs.link(itemPath, targetFile, err => {
      const result = err ? '[error]' : '[success]';
      console.log(itemPath + ' moved to ' + targetFile + ' ' + result);

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
