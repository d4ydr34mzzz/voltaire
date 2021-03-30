/* References:
 * https://www.sohamkamani.com/blog/javascript-localstorage-with-ttl-expiry/
 * https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#exceptions
 */

export const setItemInLocalStorageWithExpiry = (key, value, ttl) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime + ttl,
  };

  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    return;
  }
};

export const getItemFromLocalStorageWithExpiryCheck = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }

  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    return null;
  }
};
