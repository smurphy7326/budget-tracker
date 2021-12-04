let db;
const request = indexedDB.open('budget_tracker', 1); // make the connection

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    // this part is going to check to see if the app is online before reading the db
    if(navigator.onLine) {
        uploadTransaction();
    }
  }

  request.onerror= function(event) {
    console.log(event.target.errorCode);
  };

  // This is to save the records that you may have

  function saveRecord(record) {
      const transaction = db.transaction(["new_transaction", "readwrite"]);
      const transactionObjectStore = transaction.objectStore("new_transaction")
      transactionObjectStore.add(record);
  };

  // This is to upload the different transactions 
  function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');
    const getAll = transactionObjectStore.getAll();
    
    getAll.onSuccess = function() {
        if(getAll.result.length > 0 ) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application,JSON, text/plain, */*',
                    'Content-type': 'application/json'
                }
            })
        }
    }
  }



