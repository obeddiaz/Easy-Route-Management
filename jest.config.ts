import { createDefaultPreset } from 'ts-jest';
import type { Config } from 'jest';

const tsJestTransformCfg = createDefaultPreset().transform;

const jestConfig: Config = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};

export default jestConfig;
