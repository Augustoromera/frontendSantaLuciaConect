import axios from 'axios';

const pruebaApi = axios.create({
    baseURL: 'http://santaluciaback.netlify.app/',
});

export default pruebaApi;
