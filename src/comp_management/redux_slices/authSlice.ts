import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState{
    username:string;
    roles:string[];
    isLoading:boolean;
    error:string | null;
}

const initialState:AuthState={
    username:"",
    roles:[],
    isLoading:false,
    error:null
};

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        setUsername:(state, action: PayloadAction<string>)=>{
            state.username=action.payload;
        },
        setRoles:(state,action:PayloadAction<string[]>)=>{
            state.roles=action.payload;
        },

        setIsLoading:(state,action:PayloadAction<boolean>)=>{
            state.isLoading=action.payload;
        },

        setError: (state, action: PayloadAction<string|null>)=>{
            state.error=action.payload;
        },
        resetAuth:()=>initialState
    }
});

export const {setError,setIsLoading,setRoles,setUsername,resetAuth}=authSlice.actions;
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUsername = (state: { auth: AuthState }) => state.auth.username;
export const selectRoles = (state: { auth: AuthState }) => state.auth.roles;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;



export default authSlice.reducer;
