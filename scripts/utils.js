module.exports.convertSpecToRecords = (stepList) =>
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

module.exports.differenceBy = (array1, array2, key) => array1.filter((a) => !array2.some((b) => b[key] === a[key]));
