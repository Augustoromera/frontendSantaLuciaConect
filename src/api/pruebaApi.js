import axios from 'axios';

const pruebaApi = axios.create({
    baseURL: 'https://backendsantaluciaconnect.onrender.com/',
});

export default pruebaApi;
