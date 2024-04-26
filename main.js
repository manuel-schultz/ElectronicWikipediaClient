const { app, BrowserWindow } = require('electron')
const path                   = require('path');
const remoteMain             = require('@electron/remote/main');
const dbconn                 = require("./knexconnection.js");
const ipc                    = require('electron').ipcMain;

app.on('ready', () => {
    dbconn.runMigrations().then(function() {
        let result = dbconn.asyncDbQuery(dbconn.knex.select('option_name', 'option_value').from('preferences').where({ deleted: false })).then(function (preferences) {
            let preferenceWindowHeight = preferences.find(element => element.option_name == 'windowHeight').option_value;
            let preferenceWindowWidth  = preferences.find(element => element.option_name == 'windowWidth').option_value;
            let preferenceLanguage     = preferences.find(element => element.option_name == 'language');
            let preferenceFirstRun     = preferences.find(element => element.option_name == 'firstRun');

            const win = new BrowserWindow({
                width: parseInt(preferenceWindowWidth),
                height: parseInt(preferenceWindowHeight),
                icon: path.join(__dirname, 'img', 'icon.png'),
                titleBarStyle: 'hidden',
                frame: false,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    enableRemoteModule: true,
                    webviewTag: true
                }
            })

            if (preferenceFirstRun && preferenceFirstRun.option_value === 'true') {
                win.loadFile(path.join(__dirname, 'app', 'layout.html'));
                win.once('ready-to-show', () => { 
                    win.show(); 
                });
            } else {
                win.loadFile(path.join(__dirname, 'app', 'first-run.html'));
            }

            remoteMain.enable(win.webContents);

            // @params path = 'app/layout.html'
            ipc.on('changePage', async function (event, path) {
                win.loadFile(path);
            });
        });
    });
});
