import algoliasearch from 'algoliasearch';

export type SearchOptions = {
  query: string;
};

export type Indices = {
  stepIndex: string;
  inputsIndex: string;
};

export default class StepLib {
  client: algoliasearch.Client;
  steps: algoliasearch.Index;
  inputs: algoliasearch.Index;

  constructor(
    applicationID: string,
    apiKey: string,
    { stepIndex = 'steplib_steps', inputsIndex = 'steplib_inputs' }: Indices = {} as Indices
  ) {
    this.client = algoliasearch(applicationID, apiKey);
    this.steps = this.client.initIndex(stepIndex);
    this.inputs = this.client.initIndex(inputsIndex);
  }
}
