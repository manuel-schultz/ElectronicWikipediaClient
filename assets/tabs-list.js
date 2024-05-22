$(function () {
    fillTabsList();
    tabViewSwitchView('Tiles');
    lookupTabAmount();
});

function processMenuBarHomeButtonClick() {
    let languageEntry = ipc.sendSync('get_data_structurized', { table: 'preferences', filter: { deleted: false, option_name: 'language' } });
    var iso = '';
    if (languageEntry) {
        var iso = languageEntry[0].option_value;
    }

    let urlEntry = ipc.sendSync('get_data_structurized', { table: 'homepages', filter: { deleted: false, iso: iso } });
    setWebviewSrc(urlEntry[0].homepage_uri);
}


function processMenuBarCloseButtonClick() {
    ipc.send('closeApp');
}

function processMenuBarMinimizeButtonClick() {
    ipc.send('minimizeApp');
}

function processMenuBarMaximizeButtonClick() {
    ipc.send('maximizeApp');
}

function fillTabsList() {
    const tabs = ipc.sendSync('get_data_structurized', { table: 'tabs', filter: { deleted: false } });
    const currentTabID = ipc.sendSync('get_data_structurized', { table: 'preferences', filter: { deleted: false, option_name: 'activeTab' } })[0].option_value;
    $(tabs).each( function(index) {
        let tab = $(this)[0];
        let classes = '';
        if (tab.id === parseInt(currentTabID)) {
            classes = 'activeTabEntry';
        }
        let tabListEntry = `<tr class="tabsTableSingleRow ${classes}" onclick="chooseTabEntry(${tab.id})" data-tabID="${tab.id}">
                                <td>${index + 1}.</td>
                                <td>
                                    <div>
                                        <span class="tabListPageTitle">${tab.page_title}</span>
                                    </div>
                                    <div>
                                        <span class="tabListURL tabListTableURL">(${tab.page_uri})</span>
                                    </div>
                                </td>
                                <td><button class="tabTableDeletionButton" onclick="deleteTabEntry(event, ${tab.id})">
                                    <img class="tabDeletionIcon" src="../assets/img/icons/Close.svg" alt="">
                                </button></td>
                            </tr>`;

        let tabTileEntry = `<div class="tabsContainerSingleTile ${classes}" onclick="chooseTabEntry(${tab.id})" data-tabID="${tab.id}">
                                <div><button class="tabTileDeletionButton" onclick="deleteTabEntry(event, ${tab.id})">
                                    <img class="tabDeletionIcon" src="../assets/img/icons/Close.svg" alt="">
                                </button></div>
                                <div class="tabListPageTitle">${tab.page_title}</div>
                                <div class="tabListURL">${tab.page_uri}</div>
                            </div>`;

        $('#tabsContainerViewListTableBody').append(tabListEntry);
        $('#tabsContainerViewTiles').append(tabTileEntry);
    });
}

async function deleteTabEntry(event, id) {
    event.stopPropagation();
    let tabElement = $(`tbody#tabsContainerViewListTableBody tr[data-tabID="${id}"],
                        div#tabsContainerViewTiles div.tabsContainerSingleTile[data-tabID="${id}"]`);

    let deleteTabAction = await ipc.sendSync('deleteTab', id);
    
    if (deleteTabAction.newTabUsed) {
        goToPath('layout.html');
    } else {
        tabElement.remove();
        lookupTabAmount();
        reloadTabListNumbers();
        $(`.tabsTableSingleRow[data-tabID="${deleteTabAction.activeTab}"], .tabsContainerSingleTile[data-tabID="${deleteTabAction.activeTab}"]`).addClass('activeTabEntry');
    }
}

async function createTabEntry() {
    await ipc.sendSync('createTab');
    goToPath('layout.html');
}

async function chooseTabEntry(id) {
    await ipc.sendSync('chooseTab', id);
    goToPath('layout.html');
}

function closeTabsWindow() {
    goToPath('layout.html');
}

function tabViewSwitchView(view) {
    if (view === 'List') {
        $('#tabsContainerViewTiles').addClass('hidden');
        $('#tabsContainerViewList').removeClass('hidden');

        $('#tabViewSwitchButtonList').addClass('hidden');
        $('#tabViewSwitchButtonTiles').removeClass('hidden');
    } else if (view === 'Tiles') {
        $('#tabsContainerViewList').addClass('hidden');
        $('#tabsContainerViewTiles').removeClass('hidden');

        $('#tabViewSwitchButtonTiles').addClass('hidden');
        $('#tabViewSwitchButtonList').removeClass('hidden');
    }
}

function reloadTabListNumbers() {
    let trs = $('#tabsContainerViewListTableBody tr');
    trs.each(function(index) {
        $(this).find('td').eq(0).html(`${index + 1}.`);
    });
}