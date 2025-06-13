import axios from 'axios';

const pruebaApi = axios.create({
    baseURL: 'https://santaluciaback.netlify.app/',
});

export default pruebaApi;
