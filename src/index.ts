import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';
import { BrowseOptions, SearchOptions as AlgoliaSearchOptions, ObjectWithObjectID } from '@algolia/client-search';

export type SearchOptions = {
  query?: string;
  latestOnly?: boolean;
  stepIds?: string[];
  includeInputs?: boolean;
  algoliaOptions?: AlgoliaSearchOptions;
};

const defaultStepOptions: AlgoliaSearchOptions = {
  query: '',
  attributesToRetrieve: ['csv'],
  attributesToHighlight: [],
  filters: 'is_latest:true',
  typoTolerance: false
};

const defaultInputOptions: AlgoliaSearchOptions = {
  ...defaultStepOptions,
  attributesToRetrieve: ['csv', 'order']
};

export type Indices = {
  stepIndex: string;
  inputsIndex: string;
};

export type Step = ObjectWithObjectID & {
  csv: string;
  objectID: string;
  inputs?: StepInput[];
};

export type StepInput = ObjectWithObjectID & {
  csv: string;
  order: number;
  is_latest: boolean;
  opts: [Object];
  ssh_rsa_private_key: string;
  objectID: string;
};

export default class StepLib {
  private client: SearchClient;
  private steps: SearchIndex;
  private inputs: SearchIndex;

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

    let stepsPromise;
    if (stepIds.length > 0) {
      stepsPromise = this.searchSteps(stepIds, { ...defaultStepOptions, ...options });
    } else {
      stepsPromise = this.browseAll<Step>(this.steps, { ...defaultStepOptions, ...options, query });
    }

    if (!includeInputs) {
      return await stepsPromise;
    }

    const inputsPromise = this.browseAll<StepInput>(this.inputs, query, { ...defaultInputOptions, ...options });
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

  async searchSteps(stepIds: string[], queryParams: object = {}): Promise<Step[]> {
    const [latestSteps, exactVersionSteps] = stepIds.reduce(
      ([latest, exactVersion], id) => {
        if (id.includes('@')) {
          return [latest, [...exactVersion, id]];
        }

        return [[...latest, id], exactVersion];
      },
      [[] as string[], [] as string[]]
    );

    let result: Step[] = [];

    if (latestSteps.length > 0) {
      const { hits } = await this.steps.search('', {
        filters: `(${latestSteps.map(id => `id:${id}`).join(' OR ')}) AND is_latest:true`
      });

      result = result.concat((hits as any) as Step[]);
    }

    if (exactVersionSteps.length > 0) {
      const { hits } = await this.steps.search('', {
        ...queryParams,
        filters: exactVersionSteps.map(id => `csv:${id}`).join(' OR ')
      });

      result = result.concat((hits as any) as Step[]);
    }

    return result;
  }

  async browseAll<T>(index: SearchIndex, options: AlgoliaSearchOptions & BrowseOptions<T>): Promise<T[]> {
    let result: any = [];

    await index.browseObjects({ ...options, batch: hits => (result = result.concat(hits)) });

    return result;
  }
}
