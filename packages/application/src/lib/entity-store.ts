import { LRUCache } from "lru-cache";
// import DataLoader from "dataloader";

import prisma from "@/lib/prisma";

export class EntityStore {
  private static instance: EntityStore;
  // private loader = new DataLoader<string, Entity | null | undefined>(
  //   (keys: readonly string[]) => this.batchGetEntityData(keys),
  // );

  private cache: LRUCache<string, any> = new LRUCache({
    max: 500,
    ttl: 1000 * 10,
  });

  private constructor() {
    EntityStore.instance = this;
  }

  // public async batchGetEntityData(entityIds: readonly string[]) {
  //   const entities = await prisma.entity.findMany({
  //     where: {
  //       id: {
  //         in: entityIds.slice(),
  //       },
  //       tenantId: this.tenantId,
  //     },
  //   });

  //   const byId = new Map(entities.map((entity) => [entity.id, entity]));

  //   return entityIds.map((id) => byId.get(id));
  // }

  public async getEntityData(tenantId: string, entityId: string) {
    if (this.cache.has(entityId)) {
      return this.cache.get(entityId);
    }
    const entity = await prisma.entity.findUnique({
      where: {
        id: entityId,
        tenantId,
      },
    });

    if (!entity) {
      return null;
    }

    this.cache.set(entityId, entity.data);

    return entity.data;
  }

  static init() {
    if (!EntityStore.instance) {
      return new EntityStore();
    }
    return EntityStore.instance;
  }
}
