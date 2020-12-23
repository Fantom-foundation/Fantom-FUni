import dayjs from 'dayjs';

const tRE = /(\d)([dwmy])/;

/**
 * @param {string} _code Value + (d|w|m|y)
 * @returns {{unit: string, value: number}|null}
 */
export function parseTimeCode(_code) {
    const match = tRE.exec(_code ? _code.toLowerCase() : '');

    if (match && match.length === 3) {
        return {
            value: parseInt(match[1]),
            unit: match[2],
        };
    }

    return null;
}

/**
 * @param {string} _code Value + (d|w|m|y)
 * @param {*} [_ends] Dayjs
 * @param {boolean} [_utc]
 * @returns {(number|number)[]}
 */
export function getTimeSpan(_code, _ends, _utc = true) {
    const timeCode = parseTimeCode(_code);
    const now = _utc ? dayjs.utc(_ends) : dayjs(_ends);
    let startDate = 0;

    if (timeCode) {
        if (timeCode.unit === 'w') {
            startDate = now.subtract(timeCode.value, 'week').startOf('day').unix();
        } else if (timeCode.unit === 'm') {
            startDate = now.subtract(timeCode.value, 'month').startOf('day').unix();
        } else if (timeCode.unit === 'y') {
            startDate = now.subtract(timeCode.value, 'year').startOf('day').unix();
        }
    }

    return [startDate, now.unix()];
}
