let latestURLEntry = ipc.sendSync('get_data_structurized', { table: 'preferences', filter: { deleted: false, option_name: 'latestURL' } });
$( function() {
    if (latestURLEntry) {
        setWebviewSrc(latestURLEntry[0].option_value);
    } else {
        setWebviewSrc('https://wikipedia.org/');
    }

    webviewObject = $('<webview/>', {
        id: 'webview',
        src: latestURLEntry[0].option_value
    });
    $('#wikipediaContainer').append(webviewObject);
    
    var webview = document.getElementById('webview');
    webview.addEventListener('did-navigate', (event) => {
        processWebviewRedirect(event);
    });

    webview.addEventListener('did-navigate-in-page', (event) => {
        processWebviewRedirect(event);
    });

    webview.addEventListener('page-title-updated', (event) => {
        $('#wikipediaStatusBarTitle').text(event.title);
        $('#wikipediaStatusBarTitle').attr('title', event.title);
    });
});


function setWebviewSrc(src) {
    $('webview').attr('src', src);
}

function processWebviewRedirect(event) {
    ipc.sendSync('update_data', { table: 'preferences', filter: { id: latestURLEntry[0].id }, columns: { option_value: event.url } });
    $('#wikipediaStatusBarURL').text(event.url);
    $('#wikipediaStatusBarURL').attr('title', event.url);
    updateWikipediaStatusCode(event.httpResponseCode);
}

function updateWikipediaStatusCode(http) {
    $('#wikipediaStatusBarCode').attr('title', `Status: ${http}`);
    if (http === 200) {
        $('#wikipediaStatusBarCode').attr('src', '../assets/img/icons/http-code-200.svg');
    } else {
        $('#wikipediaStatusBarCode').attr('src', '../assets/img/icons/http-code-500.svg');        
    }
}

function reloadWebViewElement() {
    let webview = $('webview');

    if (webview.length > 0) {
        webview[0].reload();
    } else {
        console.error('<webview>-Element not found.');
    }
}

function processMenuBarHomeButtonClick() {
    let languageEntry = ipc.sendSync('get_data_structurized', { table: 'preferences', filter: { deleted: false, option_name: 'language' } });
    var iso = '';
    if (languageEntry) {
        var iso = languageEntry[0].option_value;
    }
    
    let urlEntry = ipc.sendSync('get_data_structurized', { table: 'homepages', filter: { deleted: false, iso: iso } });
    setWebviewSrc(urlEntry[0].homepage_uri);
}

function processMenuBarBackButtonClick() {
    if (webview.canGoBack()) {
        webview.goBack();
    }
}

function processMenuBarForwardButtonClick() {
    if (webview.canGoForward()) {
        webview.goForward();
    }
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

function processMenuBarReloadButtonClick() {
    reloadWebViewElement();
}
