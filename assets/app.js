const $        = require('jquery'); 
const electron = require('electron');
const ipc      = electron.ipcRenderer;

String.prototype.capitalizeOnce = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.capitalize = function () {
    return this.split(' ').map(word => word.capitalizeOnce()).join(' ');
};

function showLoadingPlane() {
    let loading = $('<div/>', {
        id: 'loadingPlane'
    });

    let pleaseWait = $('<p/>', {
        text: 'Please wait...',
        id: 'loadingPlaneText'
    });

    loading.append(pleaseWait);

    $('body').append(loading);
}

function hideLoadingPlane() {
    let loading = $('#loadingPlane');

    loading.remove();
}