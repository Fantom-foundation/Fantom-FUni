import Vue from 'vue';
import web3utils from 'web3-utils';
import { WEIToFTM } from './utils/transactions.js';

export const filtersOptions = {
    currLocale: 'en-US',
    currency: 'USD',
    fractionDigits: 2,
    tokenPrice: 0,
};

/**
 * @param {string|number} _timestamp
 * @return {int}
 */
export function prepareTimestamp(_timestamp) {
    if (!_timestamp) {
        return 0;
    }

    let timestamp = _timestamp;

    if (web3utils.isHexStrict(_timestamp)) {
        timestamp = formatHexToInt(_timestamp);
    }

    if (timestamp >= 1e16 || timestamp <= -1e16) {
        timestamp = Math.floor(timestamp / 1000000);
    } else if (timestamp >= 1e14 || timestamp <= -1e14) {
        timestamp /= 1000;
    } else {
        timestamp *= 1000;
    }

    return timestamp;
}

/**
 * @param {string|number} _timestamp
 * @return {Date|''}
 */
export function timestampToDate(_timestamp) {
    const timestamp = prepareTimestamp(_timestamp);

    if (!timestamp) {
        return '';
    }

    return new Date(timestamp);
}

/**
 * @param {string|Date} _value
 * @param {boolean} [_notWeekday]
 * @param {boolean} [_withTime]
 * @param {object} [_options]
 * @return {string}
 */
export function formatDate(_value, _notWeekday, _withTime, _options = {}) {
    if (!_value) {
        return '';
    }

    const date = _value instanceof Date ? _value : new Date(_value);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ..._options,
    };

    if (!_notWeekday) {
        options.weekday = 'short';
    }

    if (_withTime) {
        options.hour = 'numeric';
        options.minute = 'numeric';
    }

    return date.toLocaleDateString(filtersOptions.currLocale, options);
    // return date.toLocaleDateString('en-GB', options);
}

/**
 * @param {string|number} _value
 * @return {string}
 */
export function formatDuration(_value) {
    if (!_value) {
        return '';
    }

    let timestamp = _value;

    if (web3utils.isHexStrict(_value)) {
        timestamp = formatHexToInt(_value);
    }

    if (timestamp) {
        return `${parseInt(timestamp / 3600) % 60}h ${parseInt(timestamp / 60) % 60}m ${timestamp % 60}s`;
    }

    return '';
}

/**
 * @param {number} _number
 * @param {number} [_fractionDigits]
 * @param {string} [_currency]
 * @return {*}
 */
export function formatNumberByLocale(_number, _fractionDigits = filtersOptions.fractionDigits, _currency) {
    let options = {
        minimumFractionDigits: _fractionDigits,
        maximumFractionDigits: _fractionDigits,
    };

    if (_currency) {
        options.style = 'currency';
        options.currency = _currency;
    }

    return new Intl.NumberFormat(filtersOptions.currLocale, options).format(_number);
}

/**
 * @param {number} _value
 * @param {number} _tokenPrice
 * @param {boolean} [_fromWEI]
 * @param {int} [_fractionDigits]
 * @param {string} [_currency]
 * @return {*}
 */
export function formatCurrencyByLocale(
    _value,
    _tokenPrice,
    _fromWEI = true,
    _fractionDigits = filtersOptions.fractionDigits,
    _currency = filtersOptions.currency
) {
    const value = _fromWEI ? WEIToFTM(_value) : _value;

    return formatNumberByLocale(value * _tokenPrice, _fractionDigits, _currency);
}

/**
 * @param {string} _value
 * @return {string}
 */
export function formatHash(_value) {
    if (!_value) {
        return '';
    }

    const leftChars = 8;
    const rightChars = 6;

    if (_value.length > leftChars + rightChars + 3) {
        return `${_value.slice(0, leftChars)} ... ${_value.slice(-rightChars)}`;
    }

    return _value;
}

/**
 * @param {string} _value
 * @return {int}
 */
export function formatHexToInt(_value) {
    if (!_value) {
        return '';
    }

    // return web3utils.toBN(_value);
    return parseInt(_value, 16);
}

/**
 * @param {string|number} _value*
 * @param {int} _digits
 * @return {string}
 */
export function numToFixed(_value, _digits) {
    let value = _value;

    if (web3utils.isHexStrict(_value)) {
        value = formatHexToInt(_value);
    }

    return Number.parseFloat(value).toFixed(_digits);
}

Vue.filter('formatDate', formatDate);
Vue.filter('formatDuration', formatDuration);
Vue.filter('formatHash', formatHash);
Vue.filter('formatHexToInt', formatHexToInt);
