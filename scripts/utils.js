const zipObject = require('lodash.zipobject');
const get = require('lodash.get');
const isEqual = require('lodash.isequal');

const pick = (obj, paths) =>
  zipObject(
    paths,
    paths.map((key) => get(obj, key))
  );

const convertSpecToRecords = (stepList) =>
  Object.entries(stepList).reduce(
    ({ steps, inputs }, [id, { versions, ...details }]) => {
      const { steps: s, inputs: i } = Object.entries(versions).reduce(
        ({ steps, inputs }, [version, { inputs: stepInputs = [], ...step }]) => {
          const cvs = `${id}@${version}`,
            isLatest = details.latest_version_number === version,
            isDeprecated = !!details.info.removal_date;

          const exctractedInputs = stepInputs.map((input, idx) => ({
            cvs,
            order: idx,
            is_latest: isLatest,
            ...input,
          }));

          return {
            inputs: [...inputs, ...exctractedInputs],
            steps: [
              ...steps,
              {
                ...details,
                cvs,
                id,
                version,
                is_latest: isLatest,
                is_deprecated: isDeprecated,
                step,
              },
            ],
          };
        },
        { inputs: [], steps: [] }
      );

      return { steps: steps.concat(s), inputs: inputs.concat(i) };
    },
    { inputs: [], steps: [] }
  );
const differenceBy = (array1, array2, key) => array1.filter((a) => !array2.some((b) => b[key] === a[key]));
const getChangedSteps = (prevSteps, newSteps, compareBy) => {
  return newSteps.filter((step) => {
    const prevStep = prevSteps.find(({ cvs }) => step.cvs === cvs);

    if (!prevStep) {
      return false;
    }

    const stepToCompare = pick(step, compareBy),
      prevStepToCompare = pick(prevStep, compareBy);

    return !isEqual(stepToCompare, prevStepToCompare);
  });
};

module.exports = {
  pick,
  convertSpecToRecords,
  differenceBy,
  getChangedSteps,
};
