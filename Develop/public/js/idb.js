let db;
const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above), save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run checkDatabase() function to send all local db data to api
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log("We got a problem here!", event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");

  const store = transaction.objectStore("pending");

  // add record to your store with add method.
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");

  // access your pending object store
  const store = transaction.objectStore("pending");

  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/transactions/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          // clear all items in your store
          store.clear();
        });
    }
  };
}

function deletePending() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  // clear all items in your store
  store.clear();
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
