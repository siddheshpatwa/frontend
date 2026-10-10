"use server"

import db from "@/lib/db"

export const createCollections = async ( workspaceId:string,name:string)=>{
try {
    const collection = await db.collection.create({
        data:{
            name ,
            workspace:{
                connect:{
                id:workspaceId
                }
            }
        }
    })
 return collection;
} catch (error) {
    console.log(error)
}
}


export const getCollection = async ( workspaceId:string)=>{
try {
    const collection = await db.collection.findMany({
    where:{
        workspaceId
    }
         
        
        
    })
 return collection;
} catch (error) {
    console.log(error)
}
}


export const deleteCollection = async ( collectionId:string)=>{
try {
    const collection = await db.collection.delete({
    where:{
        id:collectionId
    }
    
    })
 return collection;
} catch (error) {
    console.log(error)
}
}

export const editCollection = async ( collectionId:string , name :string)=>{
try {
    const collection = await db.collection.update({
    where:{
        id:collectionId
    },
    data:{
        name
    }
    
    })
 return collection;
} catch (error) {
    console.log(error)
}
}