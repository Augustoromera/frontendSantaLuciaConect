import axios from 'axios';


const instance = axios.create({
    baseURL:'https://santaluciaback.netlify.app/api',
    withCredentials:true,
})


export default instance;