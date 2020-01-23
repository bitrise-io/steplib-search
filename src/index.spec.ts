import algoliasearch from 'algoliasearch';

import StepLib from '.';

const MOCK_STEP_VERSIONS = [
  { csv: 'activate-ssh-key@4.0.5', objectID: '114723561' },
  { csv: 'cocoapods-install@1.10.1', objectID: '114726881' },
  { csv: 'create-android-emulator@1.1.6', objectID: '114727601' },
  { csv: 'codecov@1.1.6', objectID: '114727221' }
];

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

  describe('list', () => {
    let steplib: StepLib;
    const initIndexMock = jest.fn(),
      browseEvent = jest.fn();

    beforeEach(() => {
      ((algoliasearch as any) as jest.Mock).mockImplementation(() => ({
        initIndex: initIndexMock.mockReturnValue({
          browseAll: () => ({
            on: browseEvent
          })
        })
      }));

      steplib = new StepLib(appId, apiKey);
    });

    test('list steps with default parameters', async () => {
      const listPromise = steplib.list();
      const [[, onResult], [, onEnd]] = browseEvent.mock.calls;

      onResult({ hits: MOCK_STEP_VERSIONS.slice(0, 2) });
      onResult({ hits: MOCK_STEP_VERSIONS.slice(2) });
      onEnd();

      const hits = await listPromise;

      expect(hits).toHaveLength(4);
      expect(hits).toEqual(MOCK_STEP_VERSIONS);
    });
  });
});
