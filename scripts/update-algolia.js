const { readFileSync } = require('fs');
const algoliasearch = require('algoliasearch');

const STEPS_INDEX_NAME = 'steplib_steps',
  INPUTS_INDEX_NAME = 'steplib_inputs';

const isDryRun = process.env.DRY_RUN === 'true';

perform();

async function perform() {
  try {
    isDryRun && console.log('Dry run..');

    const { steps: stepList } = getSpecJson();
    const [stepsIdx, inputsIdx] = getAlgoliaIndices();

    const { steps, inputs } = convertSpecToRecords(stepList);

    if (steps.length === 0 || inputs.length === 0) {
      throw new Error('Parsed steps or inputs are empty, this is probably a mistake');
    }

    console.log('Updating steps and inputs..');
    if (!isDryRun) {
      console.log(steps.length, 'step versions');
      console.log(inputs.length, 'step version inputs');

      await Promise.all([
        stepsIdx.replaceAllObjects(steps, { autoGenerateObjectIDIfNotExist: true }),
        inputsIdx.replaceAllObjects(inputs, { autoGenerateObjectIDIfNotExist: true })
      ]);
    } else {
      console.log("Would've updated..");
      console.log(steps.length, 'step versions');
      console.log(inputs.length, 'step version inputs');
    }

    console.log('Done..');
    process.exit(0);
  } catch (error) {
    console.log('Did an oopsie', error);
    process.exit(1);
  }
}

function getSpecJson() {
  const { argv } = process,
    path = argv[2];
  if (argv.length < 2 || !path) {
    throw new Error('Missing path for spec.json');
  }

  const content = readFileSync(path, 'utf-8');

  return JSON.parse(content);
}

function getAlgoliaIndices() {
  const {
    env: { ALGOLIA_APP_ID: appId, ALGOLIA_API_KEY: apiKey }
  } = process;

  if (!appId || !apiKey) {
    throw new Error('ALGOLIA_APP_ID or ALGOLIA_API_KEY not provided!');
  }

  const client = algoliasearch(appId, apiKey);

  const stepsIdx = client.initIndex(STEPS_INDEX_NAME),
    inputsIdx = client.initIndex(INPUTS_INDEX_NAME);

  return [stepsIdx, inputsIdx];
}

function convertSpecToRecords(stepList) {
  return Object.entries(stepList).reduce(
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
            ...input
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
                step
              }
            ]
          };
        },
        { inputs: [], steps: [] }
      );

      return { steps: steps.concat(s), inputs: inputs.concat(i) };
    },
    { inputs: [], steps: [] }
  );
}
