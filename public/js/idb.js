// Indexed database

let db;
const request = indexedDB.open('budget_tracker', 1); // make the connection

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        uploadTransaction();
    }
  }

  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };

  // This is to save the records that you may have

  function saveRecord(record) {
      const transaction = db.transaction(["new_transaction"], "readwrite");
      const transactionObjectStore = transaction.objectStore("new_transaction")
      transactionObjectStore.add(record);
  };

  // This is to upload the different transactions 
  function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');
    const getAll = transactionObjectStore.getAll();
    
    getAll.onsuccess = function() {
        if(getAll.result.length > 0 ) {
            fetch('/api/transaction/bulk', { // This goes to the routes/api.js file and goes to the transaction/bulk section
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application,JSON, text/plain, */*',
                    'Content-type': 'application/json'
                }
            })
            .then(response => response.json)
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse)
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite')
                const transactionObjectStore = transaction.objectStore('new_transaction');
                transactionObjectStore.clear();
                alert('All transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
  }

  window.addEventListener('online', uploadTransaction)

