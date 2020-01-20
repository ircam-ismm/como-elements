import '@babel/polyfill';
import 'source-map-support/register';

import path from 'path';
import fs from 'fs';

import { Server } from '@soundworks/core/server';
import CoMo from 'como/server';

import getConfig from './utils/getConfig';
import serveStatic from 'serve-static';
import compile from 'template-literal';
import JSON5 from 'json5';
// import services
import CoMoExperience from './CoMoExperience';

const ENV = process.env.ENV || 'default';
const config = getConfig(ENV);

// get specific CoMo config
try {
  const servicesConfigPath = path.join('config', 'como.json');
  config.como = JSON5.parse(fs.readFileSync(servicesConfigPath, 'utf-8'));
} catch(err) {
  console.log(err);
  console.log(`Invalid "como.json" config file`);
  process.exit(0);
}

const projectsDirectory = path.join(process.cwd(), 'projects');
const projectName = config.como.project;

console.log(`
--------------------------------------------------------
- running "${config.app.name}" in "${ENV}" environment -
--------------------------------------------------------
- launching CoMo project: "${config.como.project}"
- directory: "${path.join(projectsDirectory, projectName)}"
--------------------------------------------------------
`);

(async function launch() {
  try {
    const server = new Server();
    const como = new CoMo(server, projectsDirectory, projectName);

    // -------------------------------------------------------------------
    // register services (should not be needed here...)
    // -------------------------------------------------------------------

    // -------------------------------------------------------------------
    // launch application
    // -------------------------------------------------------------------

    await server.init(config, (clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        app: {
          name: config.app.name,
          author: config.app.author,
        },
        env: {
          type: config.env.type,
          websockets: config.env.websockets,
          assetsDomain: config.env.assetsDomain,
        }
      };
    });

    // CoMo is basically the appStore
    await como.init(config);
    // html template and static files (in most case, this should not be modified)
    server.configureHtmlTemplates({ compile }, path.join('.build', 'server', 'tmpl'))
    server.router.use(serveStatic('public'));
    server.router.use('build', serveStatic(path.join('.build', 'public')));

    const experience = new CoMoExperience(como);

    await server.start();
    await como.start();

    experience.start();
  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log('> Unhandled Promise Rejection');
  console.log(reason);
});
