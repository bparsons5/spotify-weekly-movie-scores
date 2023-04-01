import { logout } from "./spotify";

/**
 * Higher-order function for async/await error handling
 * @param {function} fn an async function
 * @returns {function}
 */
export const catchErrors = fn => {
  return function(...args) {
    return fn(...args).catch((err) => {
      console.error(err);
    })
  }
}

/**
 * Higher-order function for async/await error handling
 * @param {function} fn an async function
 * @returns {function}
 */
export const catchInitialErrors = (fn, logout) => {
  return function(...args) {
    return fn(...args).catch((err) => {
      logout()
      console.error(err);
    })
  }
}