declare module "@prisma/client" {
  export type PrismaLogLevel = "query" | "info" | "warn" | "error";
  export interface PrismaClientOptions {
    datasources?: Record<string, { url?: string }>;
    log?: (PrismaLogLevel | { emit: "event" | "stdout"; level: PrismaLogLevel })[];
  }

  export class PrismaClient {
    constructor(options?: PrismaClientOptions);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(event: PrismaLogLevel | "beforeExit", callback: (...args: unknown[]) => void): void;
    [key: string]: any;
  }

  export namespace Prisma {
    type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
    interface JsonObject { [key: string]: JsonValue; }
  }
}
