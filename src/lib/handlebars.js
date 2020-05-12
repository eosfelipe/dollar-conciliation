const helpers = {};

helpers.format = (dateString) => {
    // 07/05/2020
    return dateString.split('/').reverse().join('-');
};

helpers.counter = (index) => {
    return index + 1;
};

helpers.validation = (dif) => {
    return dif <= 0 ? true : false;
};

module.exports = helpers;