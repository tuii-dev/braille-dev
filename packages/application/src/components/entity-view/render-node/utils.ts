export const mergeAllOf = (schema: any) => {
  return schema.allOf.reduce((acc: any, cur: any) => {
    if ("properties" in cur) {
      return {
        ...acc,
        ...cur,
        properties: { ...acc.properties, ...cur.properties },
      };
    }

    return acc;
  }, {});
};
