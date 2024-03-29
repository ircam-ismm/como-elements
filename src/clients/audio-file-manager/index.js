import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { Client } from '@soundworks/core/client';
import initQoS from '@soundworks/template-helpers/client/init-qos.js';
import CoMo from '@ircam/como/client'
import AudioFileManagerExperience from './AudioFileManagerExperience.js';

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const config = window.soundworksConfig;
// store experiences of emulated clients
const experiences = new Set();

async function launch($container, index) {
  try {
    const client = new Client();
    await client.init(config);

    const como = new CoMo(client, audioContext);
    await como.init();
    initQoS(client, { visibilityChange: false });

    const experience = new AudioFileManagerExperience(como, config, $container);
    experiences.add(experience);

    document.body.classList.remove('loading');
    // start everything
    await client.start();
    await como.start();

    experience.start();

  } catch(err) {
    console.error(err);
  }
}

// -------------------------------------------------------------------
// bootstrapping
// -------------------------------------------------------------------
const $container = document.querySelector('#__soundworks-container');
const searchParams = new URLSearchParams(window.location.search);
// enable instanciation of multiple clients in the same page to facilitate
// development and testing (be careful in production...)
const numEmulatedClients = parseInt(searchParams.get('emulate')) || 1;

// special logic for emulated clients (1 click to rule them all)
if (numEmulatedClients > 1) {
  for (let i = 0; i < numEmulatedClients; i++) {
    const $div = document.createElement('div');
    $div.classList.add('emulate');
    $container.appendChild($div);

    launch($div, i);
  }

  const $initPlatformBtn = document.createElement('div');
  $initPlatformBtn.classList.add('init-platform');
  $initPlatformBtn.textContent = 'resume all';

  function initPlatforms(e) {
    experiences.forEach(experience => {
      if (experience.platform) {
        experience.platform.onUserGesture(e)
      }
    });
    $initPlatformBtn.removeEventListener('touchend', initPlatforms);
    $initPlatformBtn.removeEventListener('mouseup', initPlatforms);
    $initPlatformBtn.remove();
  }

  $initPlatformBtn.addEventListener('touchend', initPlatforms);
  $initPlatformBtn.addEventListener('mouseup', initPlatforms);

  $container.appendChild($initPlatformBtn);
} else {
  launch($container, 0);
}
