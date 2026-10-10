"use server";
import db from "@/lib/db";
import { currentUser } from "@/authetication/actions";
import { MEMBER_ROLE } from "@/generated/prisma/client";
import { error } from "node:console";

export const initializeWorkspace = async () => {
  const user = await currentUser();
  if (!user) {
    return {
      success: false,
      error: "user not found !!",
    };
  }

  try {
    const name = `${user.name}'s Workspace`;

    const workspace = await db.workspace.upsert({
      where: {
        name_ownerId: {
          name:"Personal Workspace",
          ownerId: user.id,
        },
      },
      update: {},
      create: {
        name:"Personal Workspace",
        ownerId: user.id,
        description:"default workspace",
        members: {
          create: {
            userId: user.id,
            role: MEMBER_ROLE.ADMIN,
          },
        },
      },
      include:{
        members:true
      }
    });
    return {
      success: true,
      workspace,
    };
  } catch (error) {
    console.log("WORKSPACE INITIALIZATION ERROR:",error);
    return {
      success: false,
      error: "Failed to initialize workspace",
    };
  }
};


export const getWorkspaces = async () =>{
  try{

    const user = await currentUser();
    if( !user) throw  new Error ("Unauthorized");
    const workspaces= await db.workspace.findMany({
      where:{
        OR:[
          { ownerId:user.id},
          {members:{some:{userId:user.id}}}
        ]
      },
      orderBy:{createdAt:"asc"}
    })
    return workspaces;
  }
  catch(error){
    console.log(error);
  }
}

export const createWorkspace = async (name:string)=>{
  try{
 const user = await currentUser();
    if( !user) throw  new Error ("Unauthorized");
  const workspace= db.workspace.create({
 data:{
  name,
  ownerId:user.id,
  members:{
      create:{
        userId:user.id,
        role:MEMBER_ROLE.ADMIN
      }
  }
 }

  })
  return workspace
  }
catch(error){
  console.log(error);

}
}
export const getWorkspaceById= async (id:string)=>{
try {
  const workspace= await db.workspace.findUnique({
    where:{id},
    include:{
      members:true
    }
  })
  return workspace;
} catch (error) {
  console.log (error);

}
}