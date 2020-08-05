module.exports = {
  testSteps_v1: {
    'test-step': {
      info: {
        asset_urls: {
          'icon.svg': 'http://step-icon.url',
        },
        maintainer: 'community',
      },
      latest_version_number: '1.0.0',
      versions: {
        '1.0.0': {
          title: 'Test Step',
          summary: 'Test Step summary',
          description: 'Test Step description',
          website: 'https://step-website.url',
          source_code_url: 'https://github.url/maintainer/test-step',
          support_url: 'http://step-support.url',
          published_at: '2016-09-16T16:24:30.0+01:00',
          source: {
            git: 'https://github.url/maintainer/test-step.git',
            commit: 'abcd1234',
          },
          asset_urls: {
            'icon.svg': 'http://step-icon.url',
          },
          type_tags: ['deploy'],
          deps: {
            brew: [{ name: 'awscli', bin_name: 'aws' }],
            apt_get: [{ name: 'awscli', bin_name: 'aws' }],
          },
          is_requires_admin_user: true,
          is_always_run: false,
          is_skippable: false,
          run_if: '',
          timeout: 0,
          inputs: [
            {
              file_path: '',
              opts: {
                category: '',
                description: '',
                is_dont_change_value: false,
                is_expand: true,
                is_required: true,
                is_sensitive: false,
                is_template: false,
                skip_if_empty: false,
                summary: 'Some input summary',
                title: 'Some input',
                unset: false,
              },
            },
          ],
          outputs: [
            {
              S3_UPLOAD_STEP_URL: '',
              opts: {
                category: '',
                description: '',
                is_dont_change_value: true,
                is_expand: false,
                is_required: true,
                is_sensitive: false,
                is_template: false,
                skip_if_empty: false,
                summary: 'Some output summary',
                title: 'Some output',
                unset: false,
              },
            },
          ],
        },
      },
    },
  },
  testSteps_v2: {
    // new version, changed maintainer
    'test-step': {
      info: {
        asset_urls: {
          'icon.svg': 'http://step-icon.url',
        },
        maintainer: 'verified',
      },
      latest_version_number: '1.1.0',
      versions: {
        '1.0.0': {
          title: 'Test Step',
          summary: 'Test Step summary',
          description: 'Test Step description',
          website: 'https://step-website.url',
          source_code_url: 'https://github.url/maintainer/test-step',
          support_url: 'http://step-support.url',
          published_at: '2016-09-16T16:24:30.0+01:00',
          source: {
            git: 'https://github.url/maintainer/test-step.git',
            commit: 'abcd1234',
          },
          asset_urls: {
            'icon.svg': 'http://step-icon.url',
          },
          type_tags: ['deploy'],
          deps: {
            brew: [{ name: 'awscli', bin_name: 'aws' }],
            apt_get: [{ name: 'awscli', bin_name: 'aws' }],
          },
          is_requires_admin_user: true,
          is_always_run: false,
          is_skippable: false,
          run_if: '',
          timeout: 0,
          inputs: [
            {
              file_path: '',
              opts: {
                category: '',
                description: '',
                is_dont_change_value: false,
                is_expand: true,
                is_required: true,
                is_sensitive: false,
                is_template: false,
                skip_if_empty: false,
                summary: 'Some input summary',
                title: 'Some input',
                unset: false,
              },
            },
          ],
          outputs: [
            {
              S3_UPLOAD_STEP_URL: '',
              opts: {
                category: '',
                description: '',
                is_dont_change_value: true,
                is_expand: false,
                is_required: true,
                is_sensitive: false,
                is_template: false,
                skip_if_empty: false,
                summary: 'Some output summary',
                title: 'Some output',
                unset: false,
              },
            },
          ],
        },
        '1.1.0': {
          title: 'Test Step',
          summary: 'Test Step summary',
          description: 'Test Step description',
          website: 'https://step-website.url',
          source_code_url: 'https://github.url/maintainer/test-step',
          support_url: 'http://step-support.url',
          published_at: '2016-09-16T16:24:30.0+01:00',
          source: {
            git: 'https://github.url/maintainer/test-step.git',
            commit: 'abcd1234',
          },
          asset_urls: {
            'icon.svg': 'http://step-icon.url',
          },
          type_tags: ['deploy'],
          deps: {
            brew: [{ name: 'awscli', bin_name: 'aws' }],
            apt_get: [{ name: 'awscli', bin_name: 'aws' }],
          },
          is_requires_admin_user: true,
          is_always_run: false,
          is_skippable: false,
          run_if: '',
          timeout: 0,
          inputs: [
            {
              file_path: '',
              opts: {
                category: '',
                description: '',
                is_dont_change_value: false,
                is_expand: true,
                is_required: true,
                is_sensitive: false,
                is_template: false,
                skip_if_empty: false,
                summary: 'Some input summary',
                title: 'Some input',
                unset: false,
              },
            },
          ],
          outputs: [
            {
              S3_UPLOAD_STEP_URL: '',
              opts: {
                category: '',
                description: '',
                is_dont_change_value: true,
                is_expand: false,
                is_required: true,
                is_sensitive: false,
                is_template: false,
                skip_if_empty: false,
                summary: 'Some output summary',
                title: 'Some output',
                unset: false,
              },
            },
          ],
        },
      },
    },
  },
};
