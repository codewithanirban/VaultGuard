import axiosClient from './axiosClient';

/**
 * Fetches all password entries for the authenticated user.
 * Supports optional search (appName/username) and category filters.
 *
 * @param {string} [search=''] - Case-insensitive search term.
 * @param {string} [category=''] - Filter by category slug.
 * @returns {Promise<object[]>} Array of decrypted password entries.
 */
export const fetchAll = async (search = '', category = '') => {
  const params = {};
  if (search.trim()) params.search = search.trim();
  if (category && category !== 'all') params.category = category;

  const { data } = await axiosClient.get('/api/passwords', { params });
  return data.entries;
};

/**
 * Creates a new password entry.
 *
 * @param {{ appName: string, username: string, password: string, category?: string, remarks?: string }} payload
 * @returns {Promise<object>} The created entry (decrypted).
 */
export const createEntry = async (payload) => {
  const { data } = await axiosClient.post('/api/passwords', payload);
  return data.entry;
};

/**
 * Updates an existing password entry.
 *
 * @param {string} id - The entry's MongoDB ObjectId.
 * @param {object} payload - Fields to update.
 * @returns {Promise<object>} The updated entry (decrypted).
 */
export const updateEntry = async (id, payload) => {
  const { data } = await axiosClient.put(`/api/passwords/${id}`, payload);
  return data.entry;
};

/**
 * Deletes a password entry.
 *
 * @param {string} id - The entry's MongoDB ObjectId.
 * @returns {Promise<object>} Server response ({ message: "Deleted" }).
 */
export const deleteEntry = async (id) => {
  const { data } = await axiosClient.delete(`/api/passwords/${id}`);
  return data;
};
