const { testSteps_v1, testSteps_v2, testSteps_v2_changed } = require('./mocks');

const { convertSpecToRecords, differenceBy, getChangedSteps, pick } = require('./utils');

describe('Script utils', () => {
  test('convertSpecToRecords', () => {
    const output = convertSpecToRecords(testSteps_v1);

    expect(output).toMatchSnapshot();
  });

  test('differenceBy', () => {
    const diff = differenceBy(
      [
        { a: 1, b: 'whatever' },
        { a: 2, b: 'whatever2' },
        { a: 3, b: 'whatever' },
      ],
      [{ a: 1 }, { a: 3 }],
      'a'
    );

    expect(diff).toEqual([{ a: 2, b: 'whatever2' }]);
  });

  test('pick', () => {
    const obj = { a: 1, b: 2, c: { d: 3 }, e: [4, 5, 6] };

    expect(pick(obj, [])).toEqual({});
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: { d: 3 } });
    expect(pick(obj, ['c.d'])).toEqual({ 'c.d': 3 });
    expect(pick(obj, ['e[1]'])).toEqual({ 'e[1]': 5 });

    expect(pick(null, ['x'])).toEqual({});
    expect(pick('abc', ['x'])).toEqual({});
  });

  describe('getChangedSteps', () => {
    const { steps: stepsV1 } = convertSpecToRecords(testSteps_v1),
      { steps: stepsV2 } = convertSpecToRecords(testSteps_v2),
      { steps: stepsV2Changed } = convertSpecToRecords(testSteps_v2_changed);

    const compareBy = ['info', 'step.asset_urls'];

    test('when there are only new steps', () => {
      const chnagedSteps = getChangedSteps([], stepsV1, compareBy);

      expect(chnagedSteps).toHaveLength(0);
    });

    test('when previous steps are not changed', () => {
      const chnagedSteps = getChangedSteps(stepsV1, stepsV2, compareBy);

      expect(chnagedSteps).toHaveLength(0);
    });

    test('when previous steps are changed', () => {
      const chnagedSteps = getChangedSteps(stepsV1, stepsV2Changed, compareBy);

      expect(chnagedSteps).toHaveLength(1);

      expect(chnagedSteps[0].info.maintainer).toBe('verified');
      expect(chnagedSteps[0].step.asset_urls['icon.svg']).toBe('http://new-step-icon.url');
    });
  });
});
