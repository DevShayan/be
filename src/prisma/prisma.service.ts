import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "generated/prisma/client";
import { handlePrismaError } from "../core/infrastructure/prisma-error/prisma-error-handler";

function wrapPrismaMethod<T extends (...args: unknown[]) => unknown>(fn: T): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error: unknown) => {
          handlePrismaError(error);
        });
      }
      return result;
    } catch (error) {
      handlePrismaError(error);
    }
  }) as T;
}

function createPrismaProxy(prisma: PrismaClient): PrismaClient {
  return new Proxy(prisma, {
    get(target, prop) {
      const value = (target as unknown as Record<string | symbol, unknown>)[prop];
      if (typeof value === "function") {
        return wrapPrismaMethod(value.bind(target));
      }
      if (value !== null && typeof value === "object") {
        return new Proxy(value as object, {
          get(subTarget, subProp) {
            const subValue = (subTarget as Record<string | symbol, unknown>)[subProp];
            if (typeof subValue === "function") {
              return wrapPrismaMethod(subValue.bind(subTarget));
            }
            return subValue;
          },
        });
      }
      return value;
    },
  });
}

const prismaClient = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const prisma = createPrismaProxy(prismaClient);

export { prisma }