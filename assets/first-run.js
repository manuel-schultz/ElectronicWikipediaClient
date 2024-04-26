const { webContents } = require('electron');

$( function () {
    const buttonContainer = $('#languageButtonContainer');
    const skipButtonContainer = $('#skipButtonContainer');
    let homepages = ipc.sendSync('get_data_structurized', { table: 'homepages', filter: { deleted: false } });

    let skipHomepage = homepages.find(item => item.iso === '');
    if (skipHomepage) {
        let button = $('<button/>', {
            id: `firstRunLanguageButton`,
            class: 'firstRunLanguageButton',
            text: skipHomepage.long_name_en,
            click: function () {
                showLoadingPlane();
                setTimeout( function() {
                    firstRunSaveLanguage(skipHomepage);
                }, 100);
            }
        })
        skipButtonContainer.append(button);
    }

    for (let i = 0; i < homepages.length; i++) {
        let languageHomepage = homepages[i];
        
        if (languageHomepage.iso === '') {
            continue;
        }

        let button = $('<button/>', {
            id: `firstRunLanguageButton${languageHomepage.iso.capitalize()}`,
            class: 'firstRunLanguageButton',
            text: languageHomepage.long_name_en,
            click: function () {
                showLoadingPlane();
                setTimeout( function() {
                    firstRunSaveLanguage(languageHomepage);
                }, 100);
            }
        })
        buttonContainer.append(button);
    }
});

function firstRunSaveLanguage(dbHomepageObject) {
    try {
        let preferences = ipc.sendSync('get_data_structurized', { table: 'preferences', filter: { deleted: false } });
        let preferencesLatestURL = preferences.find(item => item.option_name === 'latestURL');
        let preferencesFirstRun  = preferences.find(item => item.option_name === 'firstRun');
        let preferencesLanguage  = preferences.find(item => item.option_name === 'language');
    
        if (preferencesLatestURL) {
            ipc.sendSync('update_data', { table: 'preferences', filter: { id: preferencesLatestURL.id }, columns: { option_value: dbHomepageObject.homepage_uri } });
        } else {
            ipc.sendSync('insert_data', { table: 'preferences', columns: { option_name: 'latestURL', option_value: dbHomepageObject.homepage_uri } });
        }
    
        if (preferencesFirstRun) {
            ipc.sendSync('update_data', { table: 'preferences', filter: { id: preferencesFirstRun.id }, columns: { option_value: 'true' } });
        } else {
            ipc.sendSync('insert_data', { table: 'preferences', columns: { option_name: 'firstRun', option_value: 'true' } });
        }
    
        if (preferencesLanguage) {
            ipc.sendSync('update_data', { table: 'preferences', filter: { id: preferencesLanguage.id }, columns: { option_value: dbHomepageObject.iso } });
        } else {
            ipc.sendSync('insert_data', { table: 'preferences', columns: { option_name: 'language', option_value: dbHomepageObject.iso } });
        }
    
        ipc.sendSync('changePage', 'app/layout.html');
    } catch {
        hideLoadingPlane();
    }
}