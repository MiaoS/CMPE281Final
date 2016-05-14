/**
 * Created by chitoo on 3/18/16.
 */
const HOST_CALLER_INDEX = 3;

var global = {};
Object.defineProperty(global, '__stack', {
    get: function () {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__file', {
    get: function () {
        return global.__stack[HOST_CALLER_INDEX].getFileName().split('/').slice(-1)[0];
    }
});

Object.defineProperty(global, '__full_file', {
    get: function () {
        return global.__stack[HOST_CALLER_INDEX].getFileName();
    }
});

Object.defineProperty(global, '__line', {
    get: function () {
        return global.__stack[HOST_CALLER_INDEX].getLineNumber();
    }
});

function addFileAndLineInfo(args) {
    var copy = [].slice.call(args);
    copy.push('<' + global.__full_file + ':' + global.__line + '>');
    for (var i = 0; i < copy.length; ++i) {
        if (typeof copy[i] === typeof {}) {
            copy[i] = stringify(copy[i]);
        }
    }
    return copy;
}

function stringify(obj) {
    var cache = [];
    var result = JSON.stringify(obj, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return;
            }
            cache.push(value);
        }
        return value;
    });
    return result;
}

function log() {
    var args = addFileAndLineInfo(arguments);
    console.log.apply(console, args);
}

function objectify(strOrObj) {
    if (!strOrObj) {
        return strOrObj;
    }
    if (typeof strOrObj === typeof {}) {
        return strOrObj;
    }
    return JSON.parse(strOrObj);
}

//
//function goto(url) {
//    window.location.replace(url);
//}
//
//function put(key, value) {
//    localStorage[key] = JSON.stringify(value);
//}
//
//function get(key) {
//    var value = localStorage.getItem(key);
//    return value ? JSON.parse(value) : undefined;
//}