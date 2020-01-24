import algoliasearch from 'algoliasearch';

export type SearchOptions = {
  query?: string;
  latestOnly?: boolean;
  stepIds?: string[];
  includeInputs?: boolean;
  algoliaOptions?: algoliasearch.QueryParameters;
};

const defaultStepOptions: algoliasearch.QueryParameters = {
  query: '',
  attributesToRetrieve: ['csv'],
  attributesToHighlight: [],
  filters: 'is_latest:true',
  typoTolerance: false
};

const defaultInputOptions: algoliasearch.QueryParameters = {
  ...defaultStepOptions,
  attributesToRetrieve: ['csv', 'order']
};

export type Indices = {
  stepIndex: string;
  inputsIndex: string;
};

export type Step = {
  csv: string;
  objectID: string;
  inputs?: Inputs[];
};

export type Inputs = {
  csv: string;
  order: number;
  is_latest: boolean;
  opts: [Object];
  ssh_rsa_private_key: string;
  objectID: string;
};

export default class StepLib {
  private client: algoliasearch.Client;
  private steps: algoliasearch.Index;
  private inputs: algoliasearch.Index;

  constructor(
    applicationID: string,
    apiKey: string,
    { stepIndex = 'steplib_steps', inputsIndex = 'steplib_inputs' }: Indices = {} as Indices
  ) {
    this.client = algoliasearch(applicationID, apiKey);
    this.steps = this.client.initIndex(stepIndex);
    this.inputs = this.client.initIndex(inputsIndex);
  }

  async list({
    query = '',
    latestOnly = false,
    stepIds = [],
    includeInputs = false,
    algoliaOptions
  }: SearchOptions = {}): Promise<Step[]> {
    const options = {
      filters: latestOnly ? 'is_latest:true' : '',
      ...algoliaOptions
    };
    const stepsPromise = this.browseAll(this.steps, query, { ...defaultStepOptions, ...options });

    if (!includeInputs) {
      return await stepsPromise;
    }

    const inputsPromise = this.browseAll(this.inputs, query, { ...defaultInputOptions, ...options });
    const [steps, inputs] = await Promise.all([stepsPromise, inputsPromise]);

    return steps.map(({ csv, ...rest }) => {
      const stepInputs = inputs.filter(({ csv: _csv }) => _csv === csv).sort((a, b) => a.order - b.order);

      return {
        csv,
        ...rest,
        inputs: stepInputs
      };
    });
  }

  async browseAll(index: algoliasearch.Index, ...rest: any[]): Promise<any[]> {
    return new Promise(resolve => {
      const browser = index.browseAll(...rest);

      let result: any = [];

      browser.on('result', ({ hits }) => {
        result = result.concat(hits);
      });

      browser.on('end', () => {
        resolve(result);
      });
    });
  }
}
