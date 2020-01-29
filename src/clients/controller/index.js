import '@babel/polyfill';
import "@wessberg/pointer-events";
import { Client } from '@soundworks/core/client';
import CoMo from 'como/client'
import ControllerExperience from './ControllerExperience';
import initQoS from '../utils/qos';

const AudioContext = ( window.AudioContext || window.webkitAudioContext)
const audioContext = new AudioContext();
const config = window.soundworksConfig;

async function init() {
  try {
    const client = new Client();
    const como = new CoMo(client, audioContext);

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
    const experience = new ControllerExperience(como, config, $container);

    document.body.classList.remove('loading');
    // start everything
    await client.start();
    await como.start();

    experience.start();

  } catch(err) {
    console.error(err);
  }
}

window.addEventListener('load', init);
