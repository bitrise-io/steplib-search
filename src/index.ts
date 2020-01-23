import algoliasearch from 'algoliasearch';

export type SearchOptions = {
  query?: string;
  latestOnly?: boolean;
  includeInputs?: boolean;
  algoliaOptions?: algoliasearch.QueryParameters;
};

const defaultOptions: algoliasearch.QueryParameters = {
  // query: '',
  attributesToRetrieve: ['csv'],
  attributesToHighlight: [],
  filters: 'is_latest:true'
};

export type Indices = {
  stepIndex: string;
  inputsIndex: string;
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

  async list({ query = '', latestOnly = false, includeInputs = false, algoliaOptions }: SearchOptions = {}) {
    return await new Promise(resolve => {
      const browser = this.steps.browseAll(query, { ...defaultOptions, filters: latestOnly ? 'is_latest:true' : '' });
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
