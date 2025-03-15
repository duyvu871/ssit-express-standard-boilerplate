import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = (): PrismaClient => {
	return new PrismaClient({
		// log: ['query', 'info', 'warn', 'error'],
	});
};

declare global {
	var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
	interface BigInt {
		toJSON(): string;
	}
}

BigInt.prototype.toJSON = function () {
	return this.toString();
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

prisma.$use(async (params, next) => {
	const before = Date.now();

	const result = await next(params);

	const after = Date.now();

	// console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);

	return result;
})


export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;