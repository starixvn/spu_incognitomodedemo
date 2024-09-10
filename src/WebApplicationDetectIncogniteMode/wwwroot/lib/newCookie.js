var gfpCandy = (function (exports) {
    'use strict';

    var cookieKey = 'gfp';
    var storageHandlers = [localStorage, indexedDb, cookie, windowName];
    var isSet = false;
    var timeout = 200;
    function localStorage(key, value) {
        var result = getSetLocalStorage(key, value);
        return result;
    }
    function getSetLocalStorage(key, value) {
        try {
            var localStorageObj = window.localStorage;
            if (localStorageObj) {
                if (isSet) {
                    localStorageObj.setItem(key, value);
                    return Promise.resolve(null);
                }
                else {
                    value = localStorageObj.getItem(key);
                    return Promise.resolve(value);
                }
            }
        }
        catch (exception) {
        }
    }
    function indexedDb(key, value) {
        var result = getSetIndexedDb('indexedDB_ls', 'ls', key, value, isSet);
        return result;
    }
    function getSetIndexedDb(dbName, storeName, key, value, isSet) {
        return new Promise(function (resolve, reject) {
            var indexedDbObj = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
            if (indexedDbObj) {
                var request = indexedDbObj.open(dbName);
                request.onerror = function () {
                    console.log('Failed to open database');
                    resolve(null);
                };
                request.onupgradeneeded = function (event) {
                    var db = event.target.result;
                    if (db.objectStoreNames.contains(storeName)) {
                        db.deleteObjectStore(storeName);
                    }
                    db.createObjectStore(storeName);
                };
                request.onsuccess = function (event) {
                    var db = event.target.result;
                    if (db) {
                        if (!db.objectStoreNames.contains(storeName)) {
                            db.close();
                            indexedDB.deleteDatabase(dbName);
                            var request2 = indexedDB.open(dbName, 1);
                            request2.onupgradeneeded = function (event) {
                                var db2 = event.target.result;
                                db2.createObjectStore(storeName);
                            };
                            request2.onsuccess = function (event) {
                                var db2 = event.target.result;
                                var transaction = db2.transaction(storeName, "readwrite");
                                var store = transaction.objectStore(storeName);
                                store.get(key).onsuccess = function (innerEvent) {
                                    if (isSet) {
                                        store.put(value, key);
                                        resolve(null);
                                    }
                                    else {
                                        var data = innerEvent.target.result;
                                        if (data) {
                                            resolve(data);
                                        }
                                        else {
                                            resolve(null);
                                        }
                                    }
                                };
                            };
                        }
                        else {
                            var transaction = db.transaction(storeName, 'readwrite');
                            if (transaction.db.objectStoreNames.contains(storeName)) {
                                var store_1 = transaction.objectStore(storeName);
                                store_1.get(key).onsuccess = function (innerEvent) {
                                    if (isSet) {
                                        store_1.put(value, key);
                                        resolve(null);
                                    }
                                    else {
                                        var data = innerEvent.target.result;
                                        if (data) {
                                            resolve(data);
                                        }
                                        else {
                                            resolve(null);
                                        }
                                    }
                                };
                            }
                        }
                    }
                };
            }
        });
    }
    function cookie(key, value) {
        var result = getSetCookie(key, value);
        return result;
    }
    function getSetCookie(key, value) {
        return new Promise(function (resolve, reject) {
            try {
                if (isSet) {
                    var expires = '';
                    var date = new Date();
                    date.setFullYear(date.getFullYear() + 1);
                    expires = '; expires=' + date.toUTCString();
                    var setValue = key + '=' + (value || '') + expires + '; SameSite=None; Secure; path=/';
                    document.cookie = setValue;
                    resolve(null);
                }
                else {
                    var cookie_1 = null;
                    var cookieArr = document.cookie.split(';');
                    for (var i = 0; i < cookieArr.length; i++) {
                        var cookiePair = cookieArr[i].split('=');
                        if (key == cookiePair[0].trim()) {
                            cookie_1 = decodeURIComponent(cookiePair[1]);
                        }
                    }
                    resolve(cookie_1);
                }
            }
            catch (exception) {
            }
        });
    }
    function windowName(key, value) {
        var result = getSetWindowName(key, value);
        return result;
    }
    function getSetWindowName(key, value) {
        return new Promise(function (resolve, reject) {
            try {
                key = "name";
                if (isSet) {
                    var currentValue = window[key] || '';
                    if (!isValidObject(currentValue) || validateUUID(currentValue)) {
                        window[key] = value;
                    }
                    resolve(null);
                }
                else {
                    value = window[key];
                    if (!validateUUID(value)) {
                        value = null;
                    }
                    resolve(value);
                }
            }
            catch (exception) {
            }
        });
    }
    function isValidObject(obj) {
        return typeof obj !== 'undefined' && !!obj;
    }
    function generateUUIDv4() {
        var uuid = '';
        for (var i = 0; i < 32; i++) {
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            var random = (Math.random() * 16) | 0;
            if (i === 12) {
                uuid += '4';
            }
            else if (i === 16) {
                uuid += ((random & 3) | 8).toString(16);
            }
            else {
                uuid += random.toString(16);
            }
        }
        return uuid;
    }
    function validateUUID(uuid) {
        var uuidRegex = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[8|9|aA|bB][a-f\d]{3}-[a-f\d]{12}$/i;
        if (!uuidRegex.test(uuid)) {
            return false;
        }
        // Kiểm tra phiên bản UUID
        var versionBits = parseInt(uuid.charAt(14), 16);
        if (versionBits !== 4) {
            return false;
        }
        // Kiểm tra trường hợp của ký tự
        if (uuid !== uuid.toLowerCase()) {
            return false;
        }
        return true;
    }
    function waitAllWithTimeout(promises) {
        var timeoutPromise = new Promise(function (resolve, reject) {
            setTimeout(function () { return resolve(); }, timeout);
        });
        return Promise.all(promises.map(function (p) { return Promise.race([p, timeoutPromise]); }));
    }
    function getFirstMaxCountValue(arr) {
        var count = {};
        var maxCount = 0;
        var maxValue = null;
        if (arr && Array.isArray(arr) && arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                if (count[arr[i]] === undefined) {
                    count[arr[i]] = 1;
                }
                else {
                    count[arr[i]]++;
                }
                if (count[arr[i]] > maxCount && arr[i] != undefined) {
                    maxCount = count[arr[i]];
                    maxValue = arr[i];
                }
            }
        }
        return new Promise(function (resolve) {
            resolve(validateUUID(maxValue) ? maxValue : generateUUIDv4());
        });
    }
    function get(key) {
        try {
            isSet = false;
            var promises = storageHandlers.map(function (handler) {
                return new Promise(function (resolve) {
                    resolve(handler(key, null));
                });
            });
            return waitAllWithTimeout(promises).then(function (cookies) {
                return getFirstMaxCountValue(cookies).then(function (cookieValue) {
                    return Promise.resolve(cookieValue);
                });
            });
        }
        catch (exception) {
        }
    }
    function set(key, value) {
        try {
            isSet = true;
            storageHandlers.forEach(function (handler) {
                handler(key, value);
            });
        }
        catch (exception) {
        }
    }
    function getStorages(key) {
        if (key === void 0) { key = cookieKey; }
        try {
            isSet = false;
            var promises = storageHandlers.map(function (handler) {
                return new Promise(function (resolve) {
                    resolve(handler(key, null));
                });
            });
            return waitAllWithTimeout(promises).then(function (cookies) {
                var joinedCookies = cookies
                    .filter(function (cookie) { return cookie !== null && cookie !== undefined; })
                    .filter(function (cookie, index, self) { return self.indexOf(cookie) === index; })
                    .join(',');
                return Promise.resolve(joinedCookies);
            });
        }
        catch (exception) {
        }
    }
    function getStorage(key) {
        if (key === void 0) { key = cookieKey; }
        return get(key);
    }
    function setStorage(key, value) {
        if (key === void 0) { key = cookieKey; }
        if (key && value)
            set(key, value);
    }

    exports.getStorage = getStorage;
    exports.getStorages = getStorages;
    exports.setStorage = setStorage;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
