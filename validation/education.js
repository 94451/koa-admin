const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateEducationInput(data) {
    let errors = {};

    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    data.filedofstudy = !isEmpty(data.filedofstudy) ? data.filedofstudy : '';

    if (Validator.isEmpty(data.degree)) {
        errors.degree = 'degree不能为空';
    }

    if (Validator.isEmpty(data.school)) {
        errors.school = 'school不能为空';
    }

    if (Validator.isEmpty(data.from)) {
        errors.from = 'from不能为空';
    }

    if (Validator.isEmpty(data.filedofstudy)) {
        errors.filedofstudy = 'filedofstudy不能为空';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};