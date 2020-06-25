import '@babel/polyfill';
import { Client } from '@soundworks/core/client';
import CoMo from 'como/client'
import ScriptEditorExperience from './ScriptEditorExperience';
import initQoS from '../utils/qos';

// @todo - move inside CoMo ?
const config = window.soundworksConfig;

async function init($container, index) {
  try {
    const client = new Client();
    const como = new CoMo(client);

    // -------------------------------------------------------------------
    // register services
    // -------------------------------------------------------------------

    // -------------------------------------------------------------------
    // launch application
    // -------------------------------------------------------------------

    await client.init(config);
    await como.init();
    initQoS(client);

    const $container = document.querySelector('#container');
    const experience = new ScriptEditorExperience(como, config, $container);

    document.body.classList.remove('loading');

    await client.start();
    await como.start();

    experience.start();

  } catch(err) {
    console.error(err);
  }
}

window.addEventListener('load', init);
