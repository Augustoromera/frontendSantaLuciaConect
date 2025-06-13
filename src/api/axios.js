import axios from 'axios';


const instance = axios.create({
    baseURL:'http://santaluciaback.netlify.app/api',
    withCredentials:true,
})


export default instance;