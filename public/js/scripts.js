window.confirm = function (message) {
    return new Promise((resolve, reject) => {
        $('#confirmModal .modal-body').text(message);
        $('#confirmModal').modal('show');
        $('#confirmModalYes').off('click').on('click', function () {
            $('#confirmModal').modal('hide');
            resolve(true);
        });
        $('#confirmModal').off('hidden.bs.modal').on('hidden.bs.modal', function () {
            resolve(false);
        });
    });
};

window.alert = function (message) {
    return new Promise((resolve) => {
        $('#alertModal .modal-body').text(message);
        $('#alertModal').modal('show');
        $('#alertModalOk').off('click').on('click', function () {
            $('#alertModal').modal('hide');
            resolve();
        });
        $('#alertModal').off('hidden.bs.modal').on('hidden.bs.modal', function () {
            resolve();
        });
    });
};