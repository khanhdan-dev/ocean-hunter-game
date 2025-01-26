import axios from 'axios';

const BASE_URL = process.env.SERVER_PORT
  ? `http://localhost:${process.env.SERVER_PORT}/`
  : 'https://ocean-hunter-game.vercel.app/api';

export const https = axios.create({
  baseURL: BASE_URL,
  headers: {
    accept: 'application/json',
  },
});
