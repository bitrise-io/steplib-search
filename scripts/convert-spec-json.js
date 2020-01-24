const { writeFileSync } = require('fs');
const http = require('http');

justDoIt();

async function justDoIt() {
  console.log('Downloading latest spec.json..');
  const { steps: stepList } = await getSpecJson();

  console.log('Converting records..');
  const { steps, inputs } = convertSpecToRecords(stepList);

  writeFileSync('dist/steps.json', JSON.stringify(steps));
  writeFileSync('dist/inputs.json', JSON.stringify(inputs));

  console.log('Done.. Generated files are in the dist folder');
}

async function getSpecJson() {
  return new Promise((resolve, reject) => {
    http.get('http://bitrise-steplib-collection.s3.amazonaws.com/spec.json', res => {
      let rawData = '';

      res.on('data', chunk => {
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          const sizeInMb = (rawData.length / 1048576).toFixed(2);
          console.log('spec.json size:', `${sizeInMb} MB`);

          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          console.error(e.message);
          reject(e);
        }
      });
    });
  });
}

function convertSpecToRecords(stepList) {
  return Object.entries(stepList).reduce(
    ({ steps, inputs }, [id, { versions, ...details }]) => {
      const { steps: s, inputs: i } = Object.entries(versions).reduce(
        ({ steps, inputs }, [version, { inputs: stepInputs = [], ...step }]) => {
          const csv = `${id}@${version}`,
            isLatest = details.latest_version_number === version;

          const exctractedInputs = stepInputs.map((input, idx) => ({
            csv,
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
                csv,
                id,
                version,
                is_latest: isLatest,
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
