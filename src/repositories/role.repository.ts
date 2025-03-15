import prisma from './prisma';
import { Role, Prisma } from '@prisma/client';

export class RoleRepository {
    /**
     * Create a new role
     * @param data Role data to create
     * @returns Created role
     */
    async create(data: Prisma.RoleCreateInput): Promise<Role> {
        return prisma.role.create({
            data,
        });
    }

    /**
     * Find a role by ID
     * @param id Role ID
     * @returns Role or null if not found
     */
    async findById(id: number): Promise<Role | null> {
        return prisma.role.findUnique({
            where: { id },
        });
    }

    /**
     * Find a role by name
     * @param name Role name to search for
     * @returns Role or null if not found
     */
    async findByName(name: string): Promise<Role | null> {
        return prisma.role.findUnique({
            where: { name },
        });
    }

    /**
     * Get all roles
     * @returns Array of roles
     */
    async findAll(): Promise<Role[]> {
        return prisma.role.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    /**
     * Update a role
     * @param id Role ID
     * @param data Role data to update
     * @returns Updated role
     */
    async update(id: number, data: Prisma.RoleUpdateInput): Promise<Role> {
        return prisma.role.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete a role
     * @param id Role ID
     * @returns Deleted role
     */
    async delete(id: number): Promise<Role> {
        return prisma.role.delete({
            where: { id },
        });
    }

    /**
     * Find roles with their permissions
     * @returns Array of roles with their permissions
     */
    async findWithPermissions() {
        return prisma.role.findMany({
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    /**
     * Find a role with its permissions
     * @param id Role ID
     * @returns Role with permissions or null if not found
     */
    async findWithPermissionsById(id: number) {
        return prisma.role.findUnique({
            where: { id },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }

    /**
     * Find roles for a specific user
     * @param userId User ID
     * @returns Array of roles assigned to the user
     */
    async findByUserId(userId: number) {
        return prisma.role.findMany({
            where: {
                userRoles: {
                    some: {
                        userId,
                    },
                },
            },
        });
    }

    /**
     * Assign a role to a user
     * @param userId User ID
     * @param roleId Role ID
     * @returns Created user role relationship
     */
    async assignToUser(userId: number, roleId: number) {
        return prisma.userRole.create({
            data: {
                userId,
                roleId,
            },
        });
    }

    /**
     * Remove a role from a user
     * @param userId User ID
     * @param roleId Role ID
     * @returns Removed user role relationship
     */
    async removeFromUser(userId: number, roleId: number) {
        return prisma.userRole.delete({
            where: {
                userId_roleId: {
                    userId,
                    roleId,
                },
            },
        });
    }

    /**
     * Count total roles
     * @returns Count of roles
     */
    async count(): Promise<number> {
        return prisma.role.count();
    }
}