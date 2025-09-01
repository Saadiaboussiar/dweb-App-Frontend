const ACCESS_KEY='access_token'
const REFRESH_KEY='refresh_token'

export const authService={

    setTokens:(refrech_token:string,access_token:string)=>{
        sessionStorage.setItem(ACCESS_KEY,access_token);
        sessionStorage.setItem(REFRESH_KEY,refrech_token);
    },

    getTokens:()=>{
        return sessionStorage.getItem(ACCESS_KEY),sessionStorage.getItem(REFRESH_KEY);
    },

    removeTokens:()=>{
        sessionStorage.removeItem(ACCESS_KEY);
        sessionStorage.removeItem(REFRESH_KEY);
    },

    isAuthenticated:()=>{
        return !!sessionStorage.getItem(ACCESS_KEY);
    },

}



