// watchSoundsFolderTemplateLiterals.js
const fs = require('fs');
const path = require('path');

const soundsFolder = path.join(__dirname, 'sounds');
const outputFile = path.join(__dirname, 'soundsArray.js');

function getAllMp3Files(dir, fileList = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      getAllMp3Files(fullPath, fileList);
    } else if (file.isFile() && file.name.endsWith('.mp3')) {
      // Use template literal for path, safe for apostrophes
      const relativePath = `.${path.sep}${path.relative(__dirname, fullPath).replace(/\\/g, '/')}`;
      fileList.push(relativePath);
    }
  });

  return fileList;
}

function generateSoundsArray() {
  const mp3Files = getAllMp3Files(soundsFolder);
  const arrayString = `const sounds = [\n  ${mp3Files.map(f => `\`${f}\``).join(',\n  ')}\n];\n`;
  fs.writeFileSync(outputFile, arrayString);
  console.log('soundsArray.js updated!', new Date().toLocaleTimeString());
}

// Initial generation
generateSoundsArray();

// Watch folder recursively
function watchFolder(folder) {
  fs.watch(folder, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.mp3')) {
      console.log(`Change detected: ${filename} (${eventType})`);
      generateSoundsArray();
    }
  });
}

watchFolder(soundsFolder);
console.log('Watching sounds folder for changes...');
