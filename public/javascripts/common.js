/**
 * Created by chitoo on 3/18/16.
 */

function log() {
    var copy = [].slice.call(arguments);
    for (var i = 0; i < copy.length; ++i) {
        if (typeof copy[i] === typeof {}) {
            copy[i] = JSON.stringify(copy[i]);
        }
    }
    console.log.apply(console, copy);
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