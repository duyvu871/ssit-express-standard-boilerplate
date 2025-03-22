import prisma from './prisma';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
    /**
     * Create a new user
     * @param data User data to create
     * @returns Created user
     */
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
        });
    }

    /**
     * Find a user by ID
     * @param id User ID
     * @returns User or null if not found
     */
    async findById(id: number): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Find a user by username
     * @param username Username to search for
     * @returns User or null if not found
     */
    async findByUsername(username: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { username },
        });
    }

    /**
     * Find a user by email
     * @param email Email to search for
     * @returns User or null if not found
     */
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Get all users with optional pagination
     * @param skip Number of records to skip
     * @param take Number of records to take
     * @returns Array of users
     */
    async findAll(skip?: number, take?: number): Promise<User[]> {
        return prisma.user.findMany({
            skip,
            take,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Update a user
     * @param id User ID
     * @param data User data to update
     * @returns Updated user
     */
    async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete a user
     * @param id User ID
     * @returns Deleted user
     */
    async delete(id: number): Promise<User> {
        return prisma.user.delete({
            where: { id },
        });
    }

    /**
     * Find users with their roles
     * @param skip Number of records to skip
     * @param take Number of records to take
     * @returns Array of users with their roles
     */
    async findWithRoles(skip?: number, take?: number) {
        return prisma.user.findMany({
            skip,
            take,
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find a user with their profile
     * @param id User ID
     * @returns User with profile or null if not found
     */
    async findWithProfile(id: number) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                userProfile: true,
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }

    /**
     * Count total users with optional filter
     * @param where Optional filter conditions
     * @returns Count of users
     */
    async count(where?: Prisma.UserWhereInput): Promise<number> {
        return prisma.user.count({ where });
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