export enum PERMISSIONS 
{
    // NONE = "NONE", 
    READ = "READ",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    ADD = "ADD"
}

// implementation pending
// export const PERMISSIONS =
// {
//     NONE : 0,
//     READ : 1,
//     ADD : 2,
//     UPDATE : 4,
//     DELETE : 8,
// }


export const MODULES: {[key:string]:number} =
{
    "Buyer":1,
    "Seller":2,
    "Role Management": 3,
    "User" : 4,
    "Manager": 5
}