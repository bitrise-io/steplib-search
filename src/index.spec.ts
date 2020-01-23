import algoliasearch from 'algoliasearch';

import StepLib from '.';

describe(StepLib, () => {
  const appId = 'app-id',
    apiKey = 'api-key';

  beforeEach(() => {
    ((algoliasearch as any) as jest.Mock).mockClear();
  });

  it('creates a new object with default indices', () => {
    const steplib = new StepLib(appId, apiKey);
    expect(steplib).toBeDefined();
    expect(algoliasearch).toHaveBeenCalledWith(appId, apiKey);

    const [
      {
        value: { initIndex }
      }
    ] = ((algoliasearch as any) as jest.Mock).mock.results;
    expect(initIndex).toHaveBeenCalledWith('steplib_steps');
    expect(initIndex).toHaveBeenCalledWith('steplib_inputs');
  });

  it('can set custom idex values', () => {
    const stepIndex = 'some_step_index',
      inputsIndex = 'another_inputs_index';
    new StepLib(appId, apiKey, { stepIndex, inputsIndex });

    const [
      {
        value: { initIndex }
      }
    ] = ((algoliasearch as unknown) as jest.Mock).mock.results;
    expect(initIndex).toHaveBeenCalledWith(stepIndex);
    expect(initIndex).toHaveBeenCalledWith(inputsIndex);
  });
});
