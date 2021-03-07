const fs = require('fs');
const path = require('path');
const args = require('commander');
const del = require('del')
const Observer = require('./observer')

args
  .option('-i, --start [start]', 'Start folder', './start')
  .option('-f, --finish [finish]', 'Finish folder', './finish')
  .option('-d, --delete', 'Delete start folder')
  .parse(process.argv);

const options = args.opts();
const startDir = options.start;
const finishDir = options.finish;
const deleteStartDir = options.delete;

const observer = new Observer(async () => {
  console.log(`SORTING COMPLETE`)

  if (options.delete) {
      console.log('Delete folder', startDir)
      await del(startDir)
  }
})

fs.access(startDir, err => {
  if (err) {
    console.log('Start folder does not exist.');
  } else {
    fs.access(finishDir, err => {
      if (err) {
        fs.mkdir(finishDir, err => {
          if (err) {
            console.log('Can not create finish folder.');
          } else {
            sortDir(startDir);
          }
        });
      } else {
        sortDir(startDir);
      }
    });
  }
});

function sortDir(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.log('Can not read directory ' + dir);
    } else {
      files.forEach(item => {
        const itemPath = path.join(dir, item);

        observer.addObserver(itemPath)
        fs.stat(itemPath, (err, state) => {
          if (err) {
            console.log('Can not check ' + itemPath);
          } else {
            if (state.isFile()) {
              const letter = item[0].toUpperCase();
              const targetDir = path.join(finishDir, letter);
              const targetFile = path.join(targetDir, item);

              fs.access(targetDir, err => {
                if (err) {
                  fs.mkdir(targetDir, () => {
                    moveFile(item, itemPath, targetFile, targetDir, dir);
                    observer.removeObserver(itemPath)
                    fs.unlink(itemPath, () => {
                      fs.rmdir(dir, () => {});
                      fs.rmdir(startDir, () => {});
                    });
                  });
                } else {
                  moveFile(item, itemPath, targetFile, targetDir, dir);
                }
              });
            }
            if (state.isDirectory()) {
              sortDir(itemPath);
              observer.removeObserver(itemPath)
              fs.unlink(itemPath, () => {
                fs.rmdir(dir, () => {});
                fs.rmdir(startDir, () => {});
              });
            }
          }
        });
      });
    }
  });
}

function moveFile(item, itemPath, targetFile, targetDir, dir) {
  let fileNameSuffix = 1;

  while (fs.existsSync(targetFile)) {
    const itemParts = path.parse(item);
    targetFile = path.join(targetDir, itemParts.name + '_' + fileNameSuffix + itemParts.ext);
    fileNameSuffix++;
  }

  fs.link(itemPath, targetFile, err => {
    const result = err ? '[error]' : '[success]';
    console.log(itemPath + ' moved to ' + targetFile + ' ' + result);

    if (deleteStartDir) {
      fs.unlink(itemPath, () => {
        fs.rmdir(dir, () => {});
        fs.rmdir(startDir, () => {});
      });
    }
  });
}

// sortDir(startDir)
// moveFile(finishDir)
observer.start('Sorting files')