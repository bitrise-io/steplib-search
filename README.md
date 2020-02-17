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
  { "cvs": "activate-ssh-key@4.0.5" },
  { "cvs": "git-clone@4.0.18" },
  { "cvs": "git-clone@4.0.17" },
  { "cvs": "amazon-s3-deploy@3.5.8" },
  { "cvs": "project-scanner@3.3.1" },
  { "cvs": "project-scanner@3.3.0" },
  { "cvs": "carthage@3.2.2" },
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
    "cvs": "flutter@0.0.9",
    "inputs": [
      { "cvs": "flutter@0.0.9", "order": 0 },
      { "cvs": "flutter@0.0.9", "order": 1 },
      { "cvs": "flutter@0.0.9", "order": 2 }
      ...
    ]
  },
  {
    "cvs": "flutter@0.0.8",
    "inputs": [
      { "cvs": "flutter@0.0.8", "order": 0 },
      { "cvs": "flutter@0.0.8", "order": 1 },
      { "cvs": "flutter@0.0.8", "order": 2 }
    ]
  },
  {
    "cvs": "flutter-test@0.9.1",
    "inputs": [
      { "cvs": "flutter-test@0.9.1", "order": 0 },
      { "cvs": "flutter-test@0.9.1", "order": 1 }
    ]
  },
  {
    "cvs": "flutter-test@0.9.0",
    "inputs": [
      { "cvs": "flutter-test@0.9.0", "order": 0 }
    ]
  },
  {
    "cvs": "flutter-installer@0.9.2",
    "inputs": [
      { "cvs": "flutter-installer@0.9.2", "order": 0 }
    ]
  }
  ...
]
```

</p>
</details>

---

List steps by id, you can include a version to get an exact version, or omit it to get the latest

```ts
const workflowSteps: Step[] = await stepLib.list({
  stepIds: ['script', 'github-release@0.9.3', 'android-build@0.10.0'],
  algoliaOptions: {
    attributesToRetrieve: ['id', 'version', 'cvs', 'is_latest']
  }
});
```

<details>
<summary>Result</summary>
<p>

```js
// workflowSteps
[
  {
    "cvs": "script@1.1.6",
    "id": "script",
    "version": "1.1.6",
    "is_latest": true
  },
  {
    "cvs": "android-build@0.10.0",
    "id": "android-build",
    "version": "0.10.0",
    "is_latest": true
  },
  {
    "cvs": "github-release@0.9.3",
    "id": "github-release",
    "version": "0.9.3",
    "is_latest": false
  }
]
```

</p>
</details>

---

You can use `projectTypes` to speecify which platfrom you are looking for

```ts
const iosAndAndroidLatestSteps: Step[] = await stepLib.list({
  latestOnly: true,
  projectTypes: ['ios', 'android'],
  attributesToRetrieve: ['cvs', 'step.project_type_tags']
});
```

<details>
<summary>Result</summary>
<p>

```js
// iosAndAndroidLatestSteps
[
  ...
  {
    "cvs": "gradle-coveralls@1.0.1",
    "step": {
      "project_type_tags": [
        "android"
      ]
    }
  },
  {
    "cvs": "firebase-dsym-upload@1.0.1",
    "step": {
      "project_type_tags": [
        "ios",
        "xamarin",
        "react-native"
      ]
    }
  },
  {
    "cvs": "bitrise-step-icon-overlay@1.0.1",
    "step": {
      "project_type_tags": [
        "ios",
        "xamarin"
      ]
    }
  },
  {
    "cvs": "appcenter-deploy-android@1.0.1",
    "step": {
      "project_type_tags": [
        "android",
        "react-native",
        "flutter"
      ]
    }
  },
  {
    "cvs": "detekt@1.0.0",
    "step": {
      "project_type_tags": [
        "android"
      ],
    }
  },
  ...
]

```

</p>
</details>

---

With custom `algoliaOptions`, you can override any Algolia parameter

```ts
const customAlgoliaOptions: Step[] = await stepLib.list({
  query: 'react-native',
  latestOnly: false,
  algoliaOptions: {
    attributesToRetrieve: ['id', 'version', 'cvs', 'info']
  }
});
```
<details>
<summary>Result</summary>
<p>

```js
// customAlgoliaOptions
[
  {
    "cvs": "react-native-bundle@1.0.4",
    "id": "react-native-bundle",
    "version": "1.0.4",
    "info": {
      "asset_urls": {
        "icon.svg": "https://bitrise-steplib-collection.s3.amazonaws.com/steps/react-native-bundle/assets/icon.svg"
      }
    }
  },
  {
    "cvs": "install-react-native@0.9.2",
    "id": "install-react-native",
    "version": "0.9.2",
    "info": {
      "asset_urls": {
        "icon.svg": "https://bitrise-steplib-collection.s3.amazonaws.com/steps/install-react-native/assets/icon.svg"
      }
    }
  },
  {
    "cvs": "appcenter-codepush-release-react-native@0.0.2",
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
