const { readFileSync } = require('fs');
const algoliasearch = require('algoliasearch');

const STEPS_INDEX_NAME = 'steplib_steps',
  INPUTS_INDEX_NAME = 'steplib_inputs';

const { DRY_RUN, REPLACE_INDICES, INDEX_CHECK_DELAY_MS } = process.env;

const isDryRun = DRY_RUN === 'true';
const replaceIndices = REPLACE_INDICES === 'true';
const indexCheckDelay = INDEX_CHECK_DELAY_MS ? parseInt(INDEX_CHECK_DELAY_MS, 10) : 5000;

perform();

const differenceBy = (array1, array2, key) => array1.filter((a) => !array2.some((b) => b[key] === a[key]));

async function perform() {
  try {
    isDryRun && console.log('Dry run..\n');

    const { steps: stepList } = getSpecJson();
    const [stepsIdx, inputsIdx] = getAlgoliaIndices();

    const { steps, inputs } = convertSpecToRecords(stepList);

    if (steps.length === 0 || inputs.length === 0) {
      throw new Error('Parsed steps or inputs are empty, this is probably a mistake');
    }

    console.log('Parsed..');
    console.log(`${steps.length} step versions`);
    console.log(`${inputs.length} step version inputs\n`);

    if (replaceIndices) {
      console.log('Replacing steps and inputs..');
      if (!isDryRun) {
        await Promise.all([
          stepsIdx.replaceAllObjects(steps, { autoGenerateObjectIDIfNotExist: true }),
          inputsIdx.replaceAllObjects(inputs, { autoGenerateObjectIDIfNotExist: true }),
        ]);
      }
    } else {
      console.log('Updating steps and inputs..');
      const [currentSteps, currentInputs] = await Promise.all([browseAll(stepsIdx), browseAll(inputsIdx)]);

      const newSteps = differenceBy(steps, currentSteps, 'cvs'),
        newInputs = differenceBy(inputs, currentInputs, 'cvs');

      if (!isDryRun) {
        await Promise.all([
          newSteps.length ? stepsIdx.saveObjects(newSteps, { autoGenerateObjectIDIfNotExist: true }) : Promise.resolve,
          newInputs.length
            ? inputsIdx.saveObjects(newInputs, { autoGenerateObjectIDIfNotExist: true })
            : Promise.resolve,
        ]);
      }

      console.log('Added..');
      console.log(`${newSteps.length} new step versions`);
      console.log(`${newInputs.length} new step version inputs\n`);
    }

    console.log('Wait for Algolia to sync');
    await new Promise((resolve) => setTimeout(resolve, indexCheckDelay));

    console.log('Checking indices');
    await Promise.all([
      assertIndexCount(stepsIdx, steps.length, 'Step index record counts not matching!'),
      assertIndexCount(inputsIdx, inputs.length, 'Input index record counts not matching!'),
    ]);

    console.log('Done..');
    process.exit(0);
  } catch (error) {
    console.log('Did an oopsie', error);
    process.exit(1);
  }
}

async function browseAll(idx) {
  let result = [];

  await idx.browseObjects({
    query: '',
    attributesToRetrieve: ['cvs'],
    attributesToHighlight: [],
    typoTolerance: false,
    restrictSearchableAttributes: ['cvs'],
    batch: (hits) => (result = result.concat(hits)),
  });

  return result;
}

async function assertIndexCount(idx, expected, msg) {
  const { nbHits: actual } = await idx.search('', {
    restrictSearchableAttributes: [],
    attributesToRetrieve: [],
    attributesToHighlight: [],
    hitsPerPage: 0,
    typoTolerance: 0,
  });

  if (actual !== expected) {
    console.error('Index record count mismatch', { expected, actual });
    throw new Error(msg);
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
    env: { ALGOLIA_APP_ID: appId, ALGOLIA_API_KEY: apiKey },
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
}
