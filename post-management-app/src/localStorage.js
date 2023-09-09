// localStorage.js

// Get an item from local storage
export const getItem = (key) => {
    return localStorage.getItem(key);
  };
  
  // Set an item in local storage
  export const setItem = (key, value) => {
    localStorage.setItem(key, value);
  };
  

// Get the delete queue from local storage
export const getDeleteQueue = () => {
    const deleteQueue = getItem('deleteQueue');
    return deleteQueue ? JSON.parse(deleteQueue) : [];
  };
  
  // Add an item to the delete queue in local storage
  export const addToDeleteQueue = (postId) => {
    const deleteQueue = getDeleteQueue();
    deleteQueue.push(postId);
    setItem('deleteQueue', JSON.stringify(deleteQueue));
  };
  
  // Remove an item from the delete queue in local storage
  export const removeFromDeleteQueue = (postId) => {
    const deleteQueue = getDeleteQueue();
    const updatedQueue = deleteQueue.filter((id) => id !== postId);
    setItem('deleteQueue', JSON.stringify(updatedQueue));
  };
  