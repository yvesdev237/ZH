import { rolePermission } from "./rolePermission"

export const permissionCheck = ({user , permission, role}) => {
    if(!user) return false
    
    const userRole = role || user?.user_metadata?.role
    const permissions = rolePermission[userRole] || []  

    return permissions.includes(permission)
}