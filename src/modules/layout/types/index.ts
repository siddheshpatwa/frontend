export interface UserProps{
    id:string;
    name:string;
    image:string | null;
    email:string;
    createdAt:Date;
    updatedAt:Date;
}

export interface WorkspaceProps{
    id:string;
    name:string;
    description:string | null;
    ownerId:string;
    createdAt:Date;
    updatedAt:Date;
}