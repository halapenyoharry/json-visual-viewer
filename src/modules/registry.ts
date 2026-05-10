import type { JsonModule, ParamSchema } from "./types";
import { treeModule } from "./tree";

const modules = new Map<string, JsonModule<ParamSchema>>();

export function registerModule<S extends ParamSchema>(
  mod: JsonModule<S>,
): void {
  modules.set(mod.id, mod as JsonModule<ParamSchema>);
}

export function getModule(id: string): JsonModule<ParamSchema> | undefined {
  return modules.get(id);
}

export function listModules(): JsonModule<ParamSchema>[] {
  return Array.from(modules.values());
}

// Built-in modules. As more views migrate, register them here.
registerModule(treeModule);
