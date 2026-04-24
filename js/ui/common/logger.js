const LEVEL = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, NONE: 4 };

const _badge = 'padding:2px 6px;border-radius:3px;font-weight:bold;color:#fff;';
const _styles = {
    [LEVEL.DEBUG]: _badge + 'background:linear-gradient(90deg,#8e8e93,#b0b0b6);',
    [LEVEL.INFO]:  _badge + 'background:linear-gradient(90deg,#4a90e2,#6cc8ff);',
    [LEVEL.WARN]:  _badge + 'background:linear-gradient(90deg,#e6a23c,#f0c060);',
    [LEVEL.ERROR]: _badge + 'background:linear-gradient(90deg,#e24a4a,#ff6b6b);',
};
const _labels = { [LEVEL.DEBUG]: 'DEBUG', [LEVEL.INFO]: 'INFO', [LEVEL.WARN]: 'WARN', [LEVEL.ERROR]: 'ERROR' };
const _reset = 'color:inherit;';

let _level = LEVEL.INFO;

function _log(level, method, args) {
    if (level < _level) return;
    console[method](`%c ${_labels[level]} %c`, _styles[level], _reset, ...args);
}

export const logger = {
    LEVEL,
    setLevel(level) { _level = level; },
    getLevel() { return _level; },
    debug(...args) { _log(LEVEL.DEBUG, 'log', args); },
    info(...args) { _log(LEVEL.INFO, 'log', args); },
    warn(...args) { _log(LEVEL.WARN, 'warn', args); },
    error(...args) { _log(LEVEL.ERROR, 'error', args); },
};

export default logger;
