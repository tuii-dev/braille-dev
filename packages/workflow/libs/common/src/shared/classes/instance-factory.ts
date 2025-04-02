import addFormats from 'ajv-formats';
import Ajv from 'ajv';

const FactoryClasses = {
  ajv: Ajv,
};

// Not implemented as a service because it needs to be accessed in
// decorator functions which do not support DI.

class Factory {
  static create = <T extends keyof typeof FactoryClasses>(
    key: T,
  ): InstanceType<(typeof FactoryClasses)[T]> | undefined => {
    if (!FactoryClasses[key]) {
      return undefined;
    } else {
      if (key === 'ajv') {
        const ajv = new Ajv({ useDefaults: 'empty', coerceTypes: true });
        ajv.addKeyword('x-primary-key');
        ajv.addVocabulary([
          'x-braille-ui',
          'x-entity',
          'x-braille-order',
          'x-foreign-key',
        ]);
        addFormats(ajv);

        return ajv as InstanceType<(typeof FactoryClasses)[T]>;
      }
      // Extend here
    }
  };
}

export { Factory, FactoryClasses };
