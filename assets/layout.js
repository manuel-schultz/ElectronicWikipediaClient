$( function() {
    let latestURLEntry = ipc.sendSync('get_data_structurized', { table: 'preferences', filter: { deleted: false, option_name: 'latestURL' } });
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
        ipc.sendSync('update_data', {table: 'preferences', filter: {id: latestURLEntry[0].id}, columns: {option_value: event.url}});
    });

    webview.addEventListener('did-navigate-in-page', (event) => {
        ipc.sendSync('update_data', {table: 'preferences', filter: {id: latestURLEntry[0].id}, columns: {option_value: event.url}});
    });
});


function setWebviewSrc(src) {
    $('webview').attr('src', src);
}