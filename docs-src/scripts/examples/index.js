import quickstart from './quickstart.js?raw';
import services from './services.js?raw';
import parameters from './parameters.js?raw';
import factory from './factory.js?raw';
import protect from './protect.js?raw';
import extend from './extend.js?raw';
import unset from './unset.js?raw';
import proxy from './proxy.js?raw';
import typescript from './typescript.js?raw';
import express from './express.js?raw';
import testing from './testing.js?raw';

export const examples = {
  quickstart: {
    javascript: quickstart,
  },
  services: {
    javascript: services,
  },
  parameters: {
    javascript: parameters,
  },
  factory: {
    javascript: factory,
  },
  protect: {
      javascript: protect,
  },
  extend: {
    javascript: extend,
  },
  unset: {
    javascript: unset,
  },
  proxy: {
    javascript: proxy,
  },
  typescript: {
    typescript: typescript.replace(/import ([^\n]+)\n/, ''),
  },
  express: {
    javascript: express,
  },
  testing: {
    javascript: testing,
  },
};
