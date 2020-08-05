const { testSteps_v1 } = require('./mocks');

const { convertSpecToRecords, differenceBy } = require('./utils');

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
});
