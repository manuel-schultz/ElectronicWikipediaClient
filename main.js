const { app, BrowserWindow } = require('electron')
const path = require('path');

//const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.131 Safari/537.36';

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'img', 'icon.png'),
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true,
        }
    })

    win.loadURL('https://de.wikipedia.org');
    // win.loadFile(path.join(__dirname, 'app', 'layout.html'));
}

app.whenReady().then(() => {
    createWindow()
})