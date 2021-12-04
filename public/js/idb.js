let db;
const request = indexedDB.open('budget_tracker', 1); // make the connection

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    // this part is going to check to see if the app is online before reading the db
    if(navigaotr).onLine) {
        uploadTransaction();
    }
};

request.oneerror = function(event) {
    console.log(event.target.errorCode);
};

