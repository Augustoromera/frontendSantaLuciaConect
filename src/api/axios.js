import axios from 'axios';


const instance = axios.create({
    baseURL:'https://backendsantaluciaconnect.onrender.com/api',
    withCredentials:true,
})


export default instance;