// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.



 //Write your JavaScript code.
console.log('---Compare memory with storage quota');
try {
    let jsHeapSizeLimit = performance.memory.jsHeapSizeLimit;
    console.log('jsHeapSizeLimit (MB): ', Math.round(jsHeapSizeLimit / (1024 * 1024)));
    console.log('jsHeapSizeLimit * 2 (MB): ', Math.round(jsHeapSizeLimit / (1024 * 1024)) * 2);
    getLocalStorage();
} catch (e) {
    console.log('Browser does not support');
}

console.log('---Check service workder is enable');
console.log('navigator.serviceWorker: ', navigator.serviceWorker);

console.log('---Try to store Blob object in indexedDB');
storeBlobToIndexedDB();










function storeBlobToIndexedDB() {
    try {

        const db = window.indexedDB.open('testIndexedDB', 1);
        console.log('database is opened ');
        db.onupgradeneeded = function (i) {
            const res = i.target?.result

            const objectStore = res.createObjectStore('testObjectStore', {
                autoIncrement: true
            });
            console.log('ObjectStore is created');

            const studentA = {
                name: 'Andres',
                lastname: 'Valdivia',
                email: 'pandres@pandres.com',
                age: 22
            };
            objectStore.put(studentA);
            console.log('JS Object is created');

            const blobObj = new Blob();
            console.log('Size of blob object: ', blobObj.size);
            objectStore.put(blobObj)
            console.log('Blob object is created');
                
            
        }
    } catch (e) {
        console.log(e)
    }
}


function getLocalStorage(){
    navigator.webkitTemporaryStorage.queryUsageAndQuota(
        function (usage, quota) {
            //console.log('Storage used: ', usage);
            //console.log('Storage quota: ', quota);
            const quotaInMib = Math.round(quota / (1024 * 1024));
            console.log('Storage quota (MB): ', quotaInMib);
        },
        function (e) {
            reject(
                new Error(
                    'detectIncognito somehow failed to query storage quota: ' +
                    e.message
                )
            )
        }
    )
}