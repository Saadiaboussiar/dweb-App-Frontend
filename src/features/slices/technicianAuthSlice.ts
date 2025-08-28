import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface technicianAuthState{
    id:number
}

const initialState:technicianAuthState={
    id:0,
};

const technicianAuthSlice=createSlice({
    name:"technicianAuth",
    initialState,  
    reducers:{
        setTechnicianId:(state, action:PayloadAction<number>)=>{
            state.id=action.payload;
        }
    }

})

export const {setTechnicianId}=technicianAuthSlice.actions;
export const selectTechnicianId = (state: { technicianAuth: technicianAuthState }) => 
  state.technicianAuth.id; 
export default technicianAuthSlice.reducer;