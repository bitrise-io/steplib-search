import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';
import { BrowseOptions, SearchOptions as AlgoliaSearchOptions, ObjectWithObjectID } from '@algolia/client-search';

export type SearchOptions = {
  query?: string;
  latestOnly?: boolean;
  stepIds?: string[];
  includeInputs?: boolean;
  projectTypes?: string[];
  algoliaOptions?: AlgoliaSearchOptions;
};

const defaultStepOptions: AlgoliaSearchOptions = {
  query: '',
  attributesToRetrieve: ['cvs'],
  attributesToHighlight: [],
  typoTolerance: false,
  restrictSearchableAttributes: ['id', 'cvs']
};

const defaultInputOptions: AlgoliaSearchOptions = {
  ...defaultStepOptions,
  attributesToRetrieve: ['cvs', 'order']
};

export type Indices = {
  stepIndex: string;
  inputsIndex: string;
};

export type Step = ObjectWithObjectID & {
  cvs: string;
  objectID: string;
  inputs?: StepInput[];
};

export type StepInput = ObjectWithObjectID & {
  cvs: string;
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
    projectTypes = [],
    algoliaOptions
  }: SearchOptions = {}): Promise<Step[]> {
    let filterList = latestOnly ? ['is_latest:true'] : [];

    if (algoliaOptions?.filters) {
      filterList.push(algoliaOptions.filters);
    }

    if (projectTypes && projectTypes.length > 0) {
      const projectFilter = `(${projectTypes.map(t => `step.project_type_tags:${t}`).join(' OR ')})`;
      filterList.push(projectFilter);
    }

    const filters = filterList.join(' AND ');

    const options = {
      ...algoliaOptions,
      filters
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

    let inputsPromise, steps: Step[], inputs: StepInput[];

    if (stepIds.length > 0) {
      steps = await stepsPromise;

      const filters = `(${steps.map(({ cvs }) => `cvs:${cvs}`).join(' OR ')})`;
      inputs = await this.browseAll<StepInput>(this.inputs, { ...defaultInputOptions, ...options, query, filters });
    } else {
      inputsPromise = this.browseAll<StepInput>(this.inputs, { ...defaultInputOptions, ...options, query });
      [steps, inputs] = await Promise.all([stepsPromise, inputsPromise]);
    }

    return steps.map(({ cvs, ...rest }) => {
      const stepInputs = inputs.filter(({ cvs: _cvs }) => _cvs === cvs).sort((a, b) => a.order - b.order);

      return {
        cvs,
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
        filters: exactVersionSteps.map(id => `cvs:${id}`).join(' OR ')
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
