const ACCESS_KEY='access_token'
const REFRESH_KEY='refresh_token'
const EXPIRES_KEY='expires-at'

export const authService={

    setTokens:(refrech_token:string,access_token:string,expiresAt:string|undefined)=>{
        sessionStorage.setItem(ACCESS_KEY,access_token);
        sessionStorage.setItem(REFRESH_KEY,refrech_token);
        sessionStorage.setItem(EXPIRES_KEY,expiresAt ? expiresAt : 'undefined');

    },

    getTokens:()=>{
        return sessionStorage.getItem(ACCESS_KEY),sessionStorage.getItem(REFRESH_KEY);
    },

    removeTokens:()=>{
        sessionStorage.removeItem(ACCESS_KEY);
        sessionStorage.removeItem(REFRESH_KEY);
        sessionStorage.removeItem(EXPIRES_KEY);
    },

    isAuthenticated:()=>{
        return !!sessionStorage.getItem(ACCESS_KEY);
    },

}



