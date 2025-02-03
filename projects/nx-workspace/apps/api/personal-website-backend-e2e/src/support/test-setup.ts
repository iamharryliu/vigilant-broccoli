/* eslint-disable */

import { LOCALHOST } from '@vigilant-broccoli/common-js';
import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? LOCALHOST;
  const port = process.env.PORT ?? '3000';
  axios.defaults.baseURL = `http://${host}:${port}`;
};
