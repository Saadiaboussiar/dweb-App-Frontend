import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface VerifyCodeState{
    verifyCode:string;
}

const initialState:VerifyCodeState={
    verifyCode:""
}

const verifyCodeSlice=createSlice({
    name:"verifyCode",
    initialState,
    reducers:{
        setVerifyCode:(state,action:PayloadAction<string>)=>{
            state.verifyCode=action.payload;
        }
    }
})

export const {setVerifyCode}=verifyCodeSlice.actions;
export const selectVerifyCode = (state: { layout:  VerifyCodeState}) => 
  state.layout.verifyCode;
export default verifyCodeSlice.reducer;