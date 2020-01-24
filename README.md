# Bitrise Steplib Search service

## Description

A small NPM library that helps you search and fetch Bitrise Workflow steps.

## How to use this library

You'll need an Algolia App ID and an API key with search and browse persmission.

### In modern stuff

```ts
import StepLib from '@bitrise/steplib-search';

const stepLib = new StepLib(
  'ALGOLIA_APP_ID',
  'ALGOLIA_API_KEY',
  // You can optionally pass a config object for the indices
  // These are the defaults
  { stepIndex: 'steplib_steps', inputsIndex: 'steplib_inputs' }
);
```

Wihtout any options, we get the all steps (and all versions) with minimal information

```ts
const latestSteps: Step[] = await stepLib.list();
```

<details>
<summary>Result</summary>
<p>

```js
// latestSteps
[
  ...
  { "csv": "activate-ssh-key@4.0.5" },
  { "csv": "git-clone@4.0.18" },
  { "csv": "git-clone@4.0.17" },
  { "csv": "amazon-s3-deploy@3.5.8" },
  { "csv": "project-scanner@3.3.1" },
  { "csv": "project-scanner@3.3.0" },
  { "csv": "carthage@3.2.2" },
  ...
]
```
</p>
</details>

---

Search for a specific step, with all versions and inputs included

```ts
const allFlutterSteps: Step[] = await stepLib.list({
  query: 'flutter',
  latestOnly: false,
  includeInputs: true
});
```

<details>
<summary>Result</summary>
<p>

```js
// allFlutterSteps
[
  ...
  {
    "csv": "flutter@0.0.9",
    "inputs": [
      { "csv": "flutter@0.0.9", "order": 0 },
      { "csv": "flutter@0.0.9", "order": 1 },
      { "csv": "flutter@0.0.9", "order": 2 }
      ...
    ]
  },
  {
    "csv": "flutter@0.0.8",
    "inputs": [
      { "csv": "flutter@0.0.8", "order": 0 },
      { "csv": "flutter@0.0.8", "order": 1 },
      { "csv": "flutter@0.0.8", "order": 2 }
    ]
  },
  {
    "csv": "flutter-test@0.9.1",
    "inputs": [
      { "csv": "flutter-test@0.9.1", "order": 0 },
      { "csv": "flutter-test@0.9.1", "order": 1 }
    ]
  },
  {
    "csv": "flutter-test@0.9.0",
    "inputs": [
      { "csv": "flutter-test@0.9.0", "order": 0 }
    ]
  },
  {
    "csv": "flutter-installer@0.9.2",
    "inputs": [
      { "csv": "flutter-installer@0.9.2", "order": 0 }
    ]
  }
  ...
]
```

</p>
</details>

---

With custom `algoliaOptions`, you can override any Algolia parameter

```ts
const allFlutterSteps: Step[] = await stepLib.list({
  query: 'react-native',
  latestOnly: false,
  algoliaOptions: {
    attributesToRetrieve: ['id', 'version', 'csv', 'info']
  }
});
```
<details>
<summary>Result</summary>
<p>

```json
[
  {
    "csv": "react-native-bundle@1.0.4",
    "id": "react-native-bundle",
    "version": "1.0.4",
    "info": {
      "asset_urls": {
        "icon.svg": "https://bitrise-steplib-collection.s3.amazonaws.com/steps/react-native-bundle/assets/icon.svg"
      }
    }
  },
  {
    "csv": "install-react-native@0.9.2",
    "id": "install-react-native",
    "version": "0.9.2",
    "info": {
      "asset_urls": {
        "icon.svg": "https://bitrise-steplib-collection.s3.amazonaws.com/steps/install-react-native/assets/icon.svg"
      }
    }
  },
  {
    "csv": "appcenter-codepush-release-react-native@0.0.2",
    "id": "appcenter-codepush-release-react-native",
    "version": "0.0.2",
    "info": {
      "asset_urls": {
        "icon.svg": "https://bitrise-steplib-collection.s3.amazonaws.com/steps/appcenter-codepush-release-react-native/assets/icon.svg"
      }
    }
  }
]
```

</p>
</details>

### In ES5 land

Include these scripts

```html
<script src="//unpkg.com/algoliasearch/dist/algoliasearch.min.js"></script>
<script src="//unpkg.com/@bitrise/steplib-search"></script>
```

Then use it similarly as descibed above

```js
var stepLib = new StepLib('ALGOLIA_APP_ID', 'ALGOLIA_API_KEY');

stepLib.list().then(function(latestSteps) {
  console.log('Yay, steps!', latestSteps);
});
```

## Development

- Install dependecies: `yarn`
- Run tests: `yarn test` or `yarn test --watch`

### Commit Messages

This repo uses a strict commit message structure that follows the [Conventional Commits](https://www.conventionalcommits.org) spec. This is used to automate publishing the package to NPM and generating the changelog with [Semantic Release](https://github.com/semantic-release/semantic-release).

## Deployment

Using [Semantic Release](https://github.com/semantic-release/semantic-release) to [NPM](https://www.npmjs.com/package/@bitrise/steplib-search)
