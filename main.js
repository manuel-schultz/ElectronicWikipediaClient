const { app, BrowserWindow, screen } = require('electron')
const path                           = require('path');
const remoteMain                     = require('@electron/remote/main');
const dbconn                         = require("./knexconnection.js");
const fs                             = require('fs');
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
                icon: path.join(__dirname, 'assets', 'img', 'logo', 'logosizes', '128x128.png'),
                titleBarStyle: 'hidden',
                frame: false,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    enableRemoteModule: true,
                    webviewTag: true
                }
            })
            setFirstTab();

            console.log('Preferences:');
            console.log(preferences);

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

            ipc.on('createTab', async function (event) {
                let newTab = await createNewHomepageTab();
                updateActiveTab(newTab[0]);

                event.returnValue = newTab;
            });

            ipc.on('chooseTab', async function (event, id) {
                updateActiveTab(id);
                event.returnValue = true;
            });

            ipc.on('deleteTab', async function (event, id) {
                let date = new Date();
                var newTabUsed = false;
                let activeTab = await dbconn.knex('preferences').where({ deleted: false, option_name: 'activeTab' });
                var activeTabID = activeTab[0].option_value;
                await dbconn.knex('tabs').where({ id: id }).update({ deleted: true, deleted_at: date });
                let allTabs = await dbconn.knex('tabs').where({ deleted: false });
                
                if (allTabs.length === 0) {
                    await createNewHomepageTab();
                    allTabs = await dbconn.knex('tabs').where({ deleted: false });
                    newTabUsed = true;
                }

                if (id === parseInt(activeTab[0].option_value)) {
                    let maxTabID = allTabs.reduce((max, obj) => (obj.id > max ? obj.id : max), -Infinity);
                    updateActiveTab(maxTabID);
                    activeTabID = maxTabID;
                }

                event.returnValue = {
                    newTabUsed: newTabUsed,
                    activeTab: activeTabID
                };
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

async function setFirstTab() {
    let tabs = await dbconn.knex.select('id', 'page_title', 'page_uri', 'tab_group_id', 'deleted').from('tabs').where({ deleted: false });

    if (tabs.length > 0) {
        return;
    }

    let preferences = await dbconn.knex.select('option_name', 'option_value', 'deleted').from('preferences').where({ deleted: false });

    let latestURL = preferences.find(element => element.option_name == 'latestURL');
    let firstTab = await createNewTab('Automatic Tab', latestURL.option_value);
    updateActiveTab(firstTab[0]);

}

async function createNewTab(title, url, groupID = null) {
    console.log('Createing New Tab with values: ', [title, url, groupID]);
    let tab = await dbconn.knex('tabs').insert(
        {
            page_title: title,
            page_uri: url,
            tab_group_id: groupID
        }
    );
    return tab;
}

async function updateActiveTab(id) {
    let activeTab = await dbconn.knex.select('id', 'option_name', 'option_value', 'deleted').from('preferences').where({ deleted: false, option_name: 'activeTab' });
    
    if (activeTab.length > 0) {
        await dbconn.knex('preferences').where({id: activeTab[0].id}).update({option_value: id});
    } else {
        var activeTabID = await dbconn.knex('preferences').insert(
            {
                option_name: 'activeTab',
                option_value: id
            }
        );
    }

    return activeTabID;
}

async function createNewHomepageTab() {
    let usedLanguage = await dbconn.knex.select('option_value').from('preferences').where({ deleted: false, option_name: 'language' });
    let usedHomepage = await dbconn.knex.select('homepage_uri').from('homepages').where({ deleted: false, iso: usedLanguage[0].option_value });
    let newTab = await createNewTab('Automatic Tab', usedHomepage[0].homepage_uri);
    return newTab;
}