import * as _ from 'lodash';

export function getJestMockFor<T>(classType: new (...args: never[]) => T): Partial<T> {
  const mock = {};
  for (const key of Object.getOwnPropertyNames(classType.prototype)) {
    if (key !== 'constructor') {
      _.set(mock, key, jest.fn());
    }
  }
  return mock;
}
