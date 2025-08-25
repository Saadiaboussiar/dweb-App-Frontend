import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LayoutState{
    isCollapsed:boolean;
}

const initialState:LayoutState={
    isCollapsed:false
}

const layoutSlice=createSlice({
    name:"layout",
    initialState,
    reducers:{
        toogleSidebar:(state)=>{
            state.isCollapsed=!state.isCollapsed
        },

        setSidebarState:(state,action:PayloadAction<boolean>)=>{
            state.isCollapsed=action.payload;
        },
    }
});

export const {toogleSidebar,setSidebarState}=layoutSlice.actions;
export const selectLayout = (state: { layout: LayoutState }) => state.layout;
export const selectIsCollapsed = (state: { layout: LayoutState }) => 
  state.layout.isCollapsed;
export default layoutSlice.reducer;