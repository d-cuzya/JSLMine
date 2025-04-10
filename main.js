import { app, BrowserWindow } from 'electron';
import fs from 'fs';

let mainWindow;
let loadingWindow;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createLoadWindow() {
  loadingWindow = new BrowserWindow({
    width: 200,
    height: 200,
  });

  loadingWindow.loadFile('./src/gui/loading.html');
  loadingWindow.setMenu(null);
}

async function init() {
  const tmp = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json');
  const data = await tmp.json();

  fs.writeFile('./src/backend/version_manifest.json', JSON.stringify(data), (err) => {
    if (err) {
      console.error('Ошибка при записи файла:', err);
    }
  });

  await sleep(5000);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  mainWindow.loadFile('./src/gui/index.html');
  mainWindow.setMenu(null);
  mainWindow.once('ready-to-show', () => {
    loadingWindow.close(); // Закрываем окно загрузки
    mainWindow.show(); // Показываем основное окно
  });
}

// Главная функция (сделаем её асинхронной)
async function main() {
  await app.whenReady(); // Ждём готовности приложения
  createLoadWindow(); // Создаём окно загрузки

  await init(); // Выполняем инициализацию (загрузку данных и задержку)
  
  createMainWindow(); // Создаём основное окно
}

// Запуск приложения
main();
