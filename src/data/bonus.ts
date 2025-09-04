import api from "../Interceptors/api";
import { getAllInterventions, type Intervention, type InterventionEssentials } from "./interventions";

export interface bonusCategoryInterface{
    points:number;
    bonusAmount:number;
    frenchName: string;
    timeInterval: string;
}

enum BonusCategories {
  CATEGORY_0 = "CATEGORY_0",
  CATEGORY_A = "CATEGORY_A", 
  CATEGORY_B = "CATEGORY_B",
  CATEGORY_C = "CATEGORY_C"
}

const PointsCategoriesDetails:Record<BonusCategories,bonusCategoryInterface>={
    [BonusCategories.CATEGORY_0]:{
      points:0,
      bonusAmount:0,
      frenchName:'Catégorie 0',
      timeInterval: '19:00'
    },
    [BonusCategories.CATEGORY_A]:{
      points:100,
      bonusAmount:200,
      frenchName:'Catégorie A',
      timeInterval: '19:00'
    },
    [BonusCategories.CATEGORY_B]:{
      points:50,
      bonusAmount:100,
      frenchName:'Catégorie B',
      timeInterval: '22:00'
    },
    [BonusCategories.CATEGORY_C]:{
      points:50,
      bonusAmount:50,
      frenchName:'Catégorie C',
      timeInterval: '00:00'
    }
}

export interface technicianBonus{
  techniciandId:number;
  interventions:InterventionEssentials[];
  bonusCategory:BonusCategories;
}

export  const interventions:Promise<Intervention[]>=getAllInterventions();

export const pointTotaux=async (interId:number)=>{
  
  const intervention=(await interventions).find((inter)=>inter.interId===interId);
  const submittedAt=intervention?.submittedAt;

}

export const getInterventionPointsCategory=async (interId:number):Promise<BonusCategories>=>{

  try{
    const response=await api.get(`/intervention/status/${interId}`);
    const points:number=response.data;

    const category=getCategoryByPoints(points);
    return category;
    
  }catch(err){
    console.log("couldnt fetch bonus category: ",err);
    return BonusCategories.CATEGORY_0;
  }
}

function getCategoryByPoints(points: number): BonusCategories {

  return Object.entries(PointsCategoriesDetails)
    .find(([_, details]) => points >= details.points)?.[0] as BonusCategories;

}

