import prisma from './prisma';
import { Permission, Prisma } from '@prisma/client';

export class PermissionRepository {
    /**
     * Create a new permission
     * @param data Permission data to create
     * @returns Created permission
     */
    async create(data: Prisma.PermissionCreateInput): Promise<Permission> {
        return prisma.permission.create({
            data,
        });
    }

    /**
     * Find a permission by ID
     * @param id Permission ID
     * @returns Permission or null if not found
     */
    async findById(id: number): Promise<Permission | null> {
        return prisma.permission.findUnique({
            where: { id },
        });
    }

    /**
     * Find a permission by name
     * @param name Permission name to search for
     * @returns Permission or null if not found
     */
    async findByName(name: string): Promise<Permission | null> {
        return prisma.permission.findUnique({
            where: { name },
        });
    }

    /**
     * Get all permissions
     * @returns Array of permissions
     */
    async findAll(): Promise<Permission[]> {
        return prisma.permission.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    /**
     * Update a permission
     * @param id Permission ID
     * @param data Permission data to update
     * @returns Updated permission
     */
    async update(id: number, data: Prisma.PermissionUpdateInput): Promise<Permission> {
        return prisma.permission.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete a permission
     * @param id Permission ID
     * @returns Deleted permission
     */
    async delete(id: number): Promise<Permission> {
        return prisma.permission.delete({
            where: { id },
        });
    }

    /**
     * Find permissions by role ID
     * @param roleId Role ID
     * @returns Array of permissions assigned to the role
     */
    async findByRoleId(roleId: number): Promise<Permission[]> {
        return prisma.permission.findMany({
            where: {
                rolePermissions: {
                    some: {
                        roleId,
                    },
                },
            },
        });
    }

    /**
     * Assign a permission to a role
     * @param roleId Role ID
     * @param permissionId Permission ID
     * @returns Created role permission relationship
     */
    async assignToRole(roleId: number, permissionId: number) {
        return prisma.rolePermission.create({
            data: {
                roleId,
                permissionId,
            },
        });
    }

    /**
     * Remove a permission from a role
     * @param roleId Role ID
     * @param permissionId Permission ID
     * @returns Removed role permission relationship
     */
    async removeFromRole(roleId: number, permissionId: number) {
        return prisma.rolePermission.delete({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                },
            },
        });
    }

    /**
     * Check if a permission is assigned to a role
     * @param roleId Role ID
     * @param permissionId Permission ID
     * @returns Boolean indicating if the permission is assigned to the role
     */
    async isAssignedToRole(roleId: number, permissionId: number): Promise<boolean> {
        const count = await prisma.rolePermission.count({
            where: {
                roleId,
                permissionId,
            },
        });
        return count > 0;
    }

    /**
     * Count total permissions
     * @returns Count of permissions
     */
    async count(): Promise<number> {
        return prisma.permission.count();
    }

    /**
     * Execute operations in a transaction
     * @param fn Function containing transaction operations
     * @returns Result of the transaction
     */
    async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
        return prisma.$transaction(fn);
    }
}