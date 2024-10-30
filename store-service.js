const fs = require('fs');

let items = [{ id: 1, category: 1, postDate: "2024-10-10", name: "Item 1" },
  { id: 2, category: 2, postDate: "2024-09-15", name: "Item 2" },];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/items.json', 'utf8', (err, data) => {
      if (err) {
        reject("Unable to read file");
        return;
      }
      items = JSON.parse(data);

      fs.readFile('./data/categories.json', 'utf8', (err, data) => {
        if (err) {
          reject("Unable to read file");
          return;
        }
        categories = JSON.parse(data);
        resolve();
      });
    });
  });
}

function getAllItems() {
  return new Promise((resolve, reject) => {
    if (items.length === 0) {
      reject("no items found");
    } else {
      resolve(items);
    }
  });
}

function addItem(itemData) {
  return new Promise((resolve, reject) => {
    if (typeof itemData.published === 'undefined') {
      itemData.published = false;
    } else {
      itemData.published = true;
    }

    // Assign a unique ID to the new item
    itemData.id = items.length + 1;

    // Add the new item to the in-memory store
    items.push(itemData);

    resolve(itemData);
  });
}

function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published);
    if (publishedItems.length === 0) {
      reject("no published items found");
    } else {
      resolve(publishedItems);
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject("No categories found");
    } else {
      resolve(categories);
    }
  });
}
// Function to get items by category
function getItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => item.category == category);
    
    if (filteredItems.length > 0) {
      resolve(filteredItems);
    } else {
      reject("No results returned.");
    }
  });
}

// Function to get items by minimum date
function getItemsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
    
    if (filteredItems.length > 0) {
      resolve(filteredItems);
    } else {
      reject("No results returned.");
    }
  });
}

// Function to get an item by ID
function getItemById(id) {
  return new Promise((resolve, reject) => {
    const item = items.find(item => item.id === id);
    
    if (item) {
      resolve(item);
    } else {
      reject("No result returned.");
    }
  });
}

// Exporting the functions
module.exports = {
  initialize,
  getAllItems,
  getCategories,
  getPublishedItems,
  addItem,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById
};