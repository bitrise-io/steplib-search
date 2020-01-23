module.exports = {
  extends: ['@commitlint/config-conventional'],
  // https://commitlint.js.org/#/reference-rules
  rules: {
    'header-max-length': [0],
    'scope-case': [2, 'always', ['lower-case', 'camel-case', 'pascal-case']],
    'subject-case': [0],
    'subject-full-stop': [0]
  }
};
