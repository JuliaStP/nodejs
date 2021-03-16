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
const deleteDir = options.delete;

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
        reject(err);
      }

      try {
        await checkAccess(finishDir);
      } catch (err) {
        try {
          await createDir(finishDir);
        } catch (err) {
          console.log('Can not create finish folder');
          reject(err);
        }
      }

      try {
        await sortDir(startDir);
      } catch (err) {}

      resolve();
    })();
  });
}

function checkAccess (path) {
  return new Promise((resolve, reject) => {
    fs.access(path, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
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

    for (let index = 0; index < files.length; index++) {
      const itemPath = path.join(dir, item);
      const stats = getStat(itemPath);

      if (stats.isDirectory()) {
        await sortDir(itemPath)
      } else {
        const letter = item[0].toUpperCase();
        const targetDir = path.join(finishDir, letter);
        const targetFile = path.join(targetDir, item);
        const checkedAccess = await checkAccess(targetDir)

        if (checkedAccess) {
          detectedFiles.push(moveFile(item, itemPath, targetFile, targetDir, dir))
        } else {
          await createDir(targetDir)
          detectedFiles.push(moveFile(item, itemPath, targetFile, targetDir, dir))
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

      if (deleteDir) {
        fs.unlink(itemPath, () => {
          fs.rmdir(dir, () => {});
          fs.rmdir(startDir, () => {});
        });
      }

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
