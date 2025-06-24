require('ignore-styles');
require('@babel/register')({
  ignore: [/(node-module)/],
  presets: ['@babel/preset-env', '@babel/preset-react']
});

require('./server.js')