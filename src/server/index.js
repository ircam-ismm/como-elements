import 'source-map-support/register';
import { Server } from '@soundworks/core/server';
import CoMo from 'como/server';
import path from 'path';
import fs from 'fs';
import serveStatic from 'serve-static';
import compile from 'template-literal';
import JSON5 from 'json5';

import CoMoExperience from './CoMoExperience';

import getConfig from './utils/getConfig.js';
const ENV = process.env.ENV || 'default';
const config = getConfig(ENV);
// get CoMo specific config
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

const server = new Server();

// html template and static files (in most case, this should not be modified)
server.templateEngine = { compile };
server.templateDirectory = path.join('.build', 'server', 'tmpl');
server.router.use(serveStatic('public'));
server.router.use('build', serveStatic(path.join('.build', 'public')));
server.router.use('vendors', serveStatic(path.join('.vendors', 'public')));

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${ENV}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

const como = new CoMo(server, projectsDirectory, projectName);

(async function launch() {
  try {
    // @todo - check how this behaves with a node client...
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
    await como.init();

    const experience = new CoMoExperience(como);

    // start all the things
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
