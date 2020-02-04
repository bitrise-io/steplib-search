import algoliasearch from 'algoliasearch';

import StepLib, { Step } from '.';

const MOCK_STEP_VERSIONS: Step[] = [
  { csv: 'activate-ssh-key@4.0.5', objectID: '114723561' },
  { csv: 'cocoapods-install@1.10.1', objectID: '114726881' },
  { csv: 'create-android-emulator@1.1.6', objectID: '114727601' },
  { csv: 'codecov@1.1.6', objectID: '114727221' }
];

const MOCK_STEP_INPUTS = [
  {
    csv: 'activate-ssh-key@4.0.5',
    order: 0,
    is_latest: true,
    opts: [Object],
    ssh_rsa_private_key: '$SSH_RSA_PRIVATE_KEY',
    objectID: '114733721'
  },
  {
    csv: 'activate-ssh-key@4.0.5',
    order: 1,
    is_latest: true,
    opts: [Object],
    ssh_key_save_path: '$HOME/.ssh/bitrise_step_activate_ssh_key',
    objectID: '114733731'
  },
  {
    csv: 'codecov@1.1.6',
    order: 0,
    is_latest: true,
    opts: [Object],
    ssh_key_save_path: '$HOME/.ssh/bitrise_step_activate_ssh_key',
    objectID: '114733743'
  }
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
      stepBrowseEvent = jest.fn(),
      inputBrowseEvent = jest.fn(),
      browseAllSteps = jest.fn(() => ({ on: stepBrowseEvent })),
      browseAllInputs = jest.fn(() => ({ on: inputBrowseEvent })),
      search = jest.fn();

    let onStepResult: (content: Pick<algoliasearch.BrowseResponse, 'hits'>) => {},
      onInputResult: (content: Pick<algoliasearch.BrowseResponse, 'hits'>) => {};
    let onStepEnd: () => {}, onInputEnd: () => {};

    beforeEach(() => {
      [initIndexMock, stepBrowseEvent, inputBrowseEvent, search].forEach(mock => mock.mockRestore());

      ((algoliasearch as any) as jest.Mock).mockImplementation(() => ({
        initIndex: initIndexMock
          .mockReturnValueOnce({
            browseAll: browseAllSteps,
            search
          })
          .mockReturnValueOnce({ browseAll: browseAllInputs })
      }));

      steplib = new StepLib(appId, apiKey);
    });

    test('list steps with default parameters', async () => {
      const listPromise = steplib.list();
      expect(browseAllSteps).toBeCalledTimes(1);
      expect(stepBrowseEvent).toBeCalledTimes(2);
      [[, onStepResult], [, onStepEnd]] = stepBrowseEvent.mock.calls;

      onStepResult({ hits: MOCK_STEP_VERSIONS.slice(0, 2) });
      onStepResult({ hits: MOCK_STEP_VERSIONS.slice(2) });
      onStepEnd();

      const hits = await listPromise;

      expect(hits).toHaveLength(4);
      expect(hits).toEqual(MOCK_STEP_VERSIONS);
    });

    test('list steps with inputs', async () => {
      const listPromise = steplib.list({ includeInputs: true });
      expect(stepBrowseEvent).toBeCalledTimes(2);
      expect(inputBrowseEvent).toBeCalledTimes(2);

      [[, onStepResult], [, onStepEnd]] = stepBrowseEvent.mock.calls;
      [[, onInputResult], [, onInputEnd]] = inputBrowseEvent.mock.calls;

      onStepResult({ hits: MOCK_STEP_VERSIONS });
      onInputResult({ hits: MOCK_STEP_INPUTS });

      onStepEnd();
      onInputEnd();

      const hits = await listPromise;

      expect(hits).toMatchSnapshot();
    });

    test('list steps by step id', async () => {
      search.mockResolvedValueOnce({ hits: [{ latest: true, csv: 'without-csv@2.0.0' }] });
      search.mockResolvedValueOnce({
        hits: [
          { latest: false, csv: 'with-csv@1.0.0' },
          { latest: false, csv: 'with-csv@1.1.0' }
        ]
      });
      const listPromise = steplib.list({ stepIds: ['without-csv', 'with-csv@1.0.0', 'with-csv@1.1.0'] });

      const hits = await listPromise;

      expect(stepBrowseEvent).toHaveBeenCalledTimes(0);
      expect(search).toHaveBeenCalledTimes(2);

      const [[{ filters: latestFilters }], [{ filters: exactFilters }]] = search.mock.calls;
      expect(latestFilters).toBe('(id:without-csv) AND is_latest:true');
      expect(exactFilters).toBe('csv:with-csv@1.0.0 OR csv:with-csv@1.1.0');

      expect(hits).toMatchSnapshot();
    });
  });
});
