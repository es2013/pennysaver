let db;
const request = indexedDB.open('pennysaver', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_entry', { autoIncrement: true });
  };
//when db is successfully created - save reference to db in global variable
request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadEntry();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_entry'], 'readwrite');
    const budgetStore = transaction.objectStore('new_entry');
    budgetStore.add(record);
}

function uploadEntry() {
      // open a transaction on your pending db
    const transaction = db.transaction(['new_entry'], 'readwrite');
      // access your pending object store
    const budgetStore = transaction.objectStore('new_entry');
      // get all records from store and set to a variable
    const getEntries = budgetStore.getAll();

    // if there was data in indexedDb's store, let's send it to the api server
    getEntries.onsuccess = function () {
        if (getEntries.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getEntries.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_entry'], 'readwrite');
                    const budgetStore = transaction.objectStore('new_entry');
                    //clear all items in your store
                    budgetStore.clear();
                })
                .catch(err => {
                    //set reference to redirect back here
                    console.log(err);
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadEntry);