const { app, BrowserWindow, screen } = require('electron')
const path                           = require('path');
const remoteMain                     = require('@electron/remote/main');
const dbconn                         = require("./knexconnection.js");
const ipc                            = require('electron').ipcMain;

app.on('ready', () => {
    dbconn.runMigrations().then(function() {
        let result = dbconn.asyncDbQuery(dbconn.knex.select('option_name', 'option_value').from('preferences').where({ deleted: false })).then(function (preferences) {
            let preferenceWindowHeight = preferences.find(element => element.option_name == 'windowHeight').option_value;
            let preferenceWindowWidth  = preferences.find(element => element.option_name == 'windowWidth').option_value;
            let preferenceWindowX      = preferences.find(element => element.option_name == 'windowCoordinationX').option_value;
            let preferenceWindowY      = preferences.find(element => element.option_name == 'windowCoordinationY').option_value;
            let preferenceLanguage     = preferences.find(element => element.option_name == 'language');
            let preferenceFirstRun     = preferences.find(element => element.option_name == 'firstRun');
            let isAppClosing           = false;

            if (preferenceFirstRun && preferenceFirstRun.option_value !== 'true') {
                preferenceWindowX = null;
                preferenceWindowY = null;
            }

            const win = new BrowserWindow({
                width: parseInt(preferenceWindowWidth),
                height: parseInt(preferenceWindowHeight),
                x: parseInt(preferenceWindowX),
                y: parseInt(preferenceWindowY),
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

            win.on("close", async function (event) {
                if (!isAppClosing) {
                    event.preventDefault();
                    console.log('Start closing App!');
                    await updateWindowDimensions(win.getBounds());
                    isAppClosing = true;
                }
                app.quit();
            });

            win.on("closed", function () {
                console.log('Finished closing App!');
            });

            // @params path = 'app/layout.html'
            ipc.on('changePage', async function (event, path) {
                win.loadFile(path);
            });

            ipc.on('closeApp', function (event, path) {
                closeApp();
            });
            
            ipc.on('minimizeApp', function (event, path) {
                minimizeApp();
            });
            
            ipc.on('maximizeApp', function (event, path) {
                toggleMaximizeApp();
            });
        });
    });
});

function closeApp() {
    if (app && !app.isQuiting) {
        app.quit();
    }
}

function minimizeApp() {
    var windows = BrowserWindow.getAllWindows();

    if (windows.length > 0) {
        var mainWindow = windows[0];
        mainWindow.minimize();
    }
}

function toggleMaximizeApp() {
    var windows = BrowserWindow.getAllWindows();

    if (windows.length > 0) {
        var mainWindow = windows[0];
    }

    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
    }
}

async function updateWindowDimensions(windowBounds) {
    const { height, width, x, y } = windowBounds;

    try {
        console.log('Start saving Bounds:');
        await dbconn.knex.transaction(async (trx) => {
            const updates = [
                { option_name: 'windowHeight', option_value: height.toString() },
                { option_name: 'windowWidth', option_value: width.toString() },
                { option_name: 'windowCoordinationX', option_value: x.toString() },
                { option_name: 'windowCoordinationY', option_value: y.toString() }
            ];

            for (const { option_name, option_value } of updates) {
                console.log(`    Saving ${option_name}`);
                await trx('preferences')
                .where({ option_name: option_name })
                .update({ option_value: option_value });
            }

            await trx.commit();
            console.log('All Bounds saved correctly!');
        });
    } catch (error) {
        await knex.rollback(error);
        console.log('Error while saveing bounds!');
    }
}