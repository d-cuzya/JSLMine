import { app, BrowserWindow } from 'electron';
import fs from 'fs';

let mainWindow;
let loadingWindow;
let createContainer 

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createLoadWindow() {
  loadingWindow = new BrowserWindow({
    width: 200,
    height: 200,
    show: false,
  });

  loadingWindow.loadFile('./src/gui/loading.html');
  loadingWindow.setMenu(null);
}

async function init() {
  const tmp = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json');
  const data = await tmp.text();

  fs.writeFile('./src/backend/version_manifest.json', JSON.stringify(data), (err) => {
    if (err) {
      console.error('Ошибка при записи файла:', err);
    }
  });

  await sleep(2500);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
  });

  mainWindow.loadFile('./src/gui/index.html');
  mainWindow.setMenu(null);
//   mainWindow.once('ready-to-show', () => {
//     loadingWindow.close();
    mainWindow.show();
//   });
}

function createCreateContainer() {
    loadingWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false
      });
    
      loadingWindow.loadFile('./src/gui/createContainer.html');
      loadingWindow.setMenu(null);
}
async function main() {
  await app.whenReady();
  createLoadWindow();
  createCreateContainer();
  await init(); 
  await loadingWindow.close();
  createMainWindow();
}

main();
