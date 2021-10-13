import { AbstractExperience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';
import CoMoPlayer from '../como-helpers/CoMoPlayer.js';
import views from '../como-helpers/views-mobile/index.js';


// for simple debugging in browser...
const MOCK_SENSORS = window.location.hash === '#mock-sensors';
console.info('> to mock sensors for debugging purpose, use https://127.0.0.1:8000/designer#mock-sensors');
console.info('> hash:', window.location.hash, '- mock sensors:', MOCK_SENSORS);

class DesignerExperience extends AbstractExperience {
  constructor(como, config, $container) {
    super(como.client);

    this.como = como;
    this.config = config;
    this.$container = $container;

    this.player = null;
    this.session = null;

    // configure como w/ the given experience
    this.como.configureExperience(this);
    renderInitializationScreens(como.client, config, $container);
  }

  async start() {
    super.start();

    // 1. create a como player instance w/ a unique id (we default to the nodeId)
    const player = await this.como.project.createPlayer(this.como.client.id);
    player.set({ metas: { type: this.client.type } });

    // the CoMoPlayer abstraction is just a shortcut for binding player,
    // sessions, and graph, triggering events when anything change.
    // cf. ../como-helpers/CoMoPlayer.js
    this.coMoPlayer = new CoMoPlayer(this.como, player);

    if (!this.como.hasDeviceMotion && !MOCK_SENSORS) {
      return this.render();
    }

    const source = this.como.hasDeviceMotion ?
      new this.como.sources.DeviceMotion(this.como, player.get('id')) :
      new this.como.sources.RandomValues(this.como, player.get('id'));

    this.coMoPlayer.setSource(source);

    // subscribe for updates to render views
    this.coMoPlayer.onChange(() => this.render());
    // if we want to track the sessions that are created and deleted
    // e.g. when displaying the session choice screen
    this.como.project.subscribe(() => this.render());

    this.listeners = {
      createSession: async (sessionName, sessionPreset) => {
        const sessionId = await this.como.project.createSession(sessionName, sessionPreset);
        return sessionId;
      },
      deleteSessionExamples: async (label = null) => {
        this.coMoPlayer.session.clearExamples(label);
      },
      setPlayerParams: async updates => {
        await this.coMoPlayer.player.set(updates);
      },
      setPlayerGraphOptions: async (moduleId, updates) => {
        await this.coMoPlayer.player.setGraphOptions(moduleId, updates);
      },
    };

    window.addEventListener('resize', () => this.render());
    this.render();
  }

  render() {
    const viewData = {
      config: this.config,
      boundingClientRect: this.$container.getBoundingClientRect(),
      project: this.como.project.getValues(),
      player: this.coMoPlayer.player.getValues(),
      session: this.coMoPlayer.session ? this.coMoPlayer.session.getValues() : null,
      graph: this.coMoPlayer.graph,
    };

    const listeners = this.listeners;

    let screen = ``;

    if (!this.como.hasDeviceMotion && !MOCK_SENSORS) {
      screen = views.sorry(viewData, listeners);
    } else if (viewData.player.loading) {
      screen = views.loading(viewData, listeners);
    } else if (this.coMoPlayer.session === null) {
      screen = views.manageSessions(viewData, listeners, {
        enableCreation: true,
        enableSelection: true,
      });
    } else {
      screen = views[this.client.type](viewData, listeners);
    }

    render(html`
      <div id="screen" style="
        box-sizing: border-box;
        width: 100%;
        min-height: 100%;
        padding: 20px;
      ">
        ${screen}
      </div>
    `, this.$container);
  }
}

export default DesignerExperience;
