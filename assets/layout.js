$( function() {
    let latestURLEntry = ipc.sendSync('get_data_structurized', { table: 'preferences', filter: { deleted: false, option_name: 'latestURL' } });
    if (latestURLEntry) {
        setIframeSrc(latestURLEntry[0].option_value);
    } else {
        setIframeSrc('https://wikipedia.org/');
    }
});



function setIframeSrc(src) {
    $('iframe').attr('src', src);
}