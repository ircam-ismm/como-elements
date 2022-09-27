#!/bin/node

const path = require('node:path');
const fs = require('node:fs');

const cwd = process.cwd();

const envName = 'rpi';

const env = `
{
  type: 'development',
  port: 443,
  subpath: '',
  useHttps: true,
  httpsInfos: {
    key: '/home/pi/certs/privkey.pem',
    cert: '/home/pi/certs/fullchain.pem',
  },
}
`;

const project = `
{
  name: 'CoMo Elements',
  author: 'Ircam - ISMM',
  project: 'default',
  preloadAudioFiles: false,
}
`;

const envFilename = path.join(cwd, 'config', 'env', `${envName}.json`);
console.log(`> writing ${envFilename}`);
fs.writeFileSync(envFilename, env);

const projectFilename = path.join(cwd, 'config', `project-${envName}.json`);
console.log(`> writing ${projectFilename}`);
fs.writeFileSync(projectFilename, project);
