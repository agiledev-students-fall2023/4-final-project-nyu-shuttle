export const localStorageSave = (name, value) => {
  try {
    localStorage.setItem(name, JSON.stringify(value));
    return 0;
  } catch {
    return 1;
  }
};

export const localStorageLoad = (name) => {
  try {
    return JSON.parse(localStorage.getItem(name));
  } catch {
    return null;
  }
};
