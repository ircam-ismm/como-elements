import { AbstractExperience } from '@soundworks/core/client';
import { render, html } from 'lit/html.js';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';
import CoMoPlayer from '../como-helpers/CoMoPlayer';
import views from '../como-helpers/views-mobile/index.js';
import colors from '../como-helpers/gui-colors.js';

// for simple debugging in browser...
const MOCK_SENSORS = window.location.hash === '#mock-sensors';
console.info('> to mock sensors for debugging purpose, use https://127.0.0.1:8000/designer#mock-sensors');
console.info('> hash:', window.location.hash, '- mock sensors:', MOCK_SENSORS);

class PlayerExperience extends AbstractExperience {
  constructor(como, config, $container) {
    super(como.client);

    this.como = como;
    this.config = config;
    this.$container = $container;

    this.player = null;
    this.session = null;

    // configure como w/ the given experience
    this.como.configureExperience(this);
    // default initialization views
    renderInitializationScreens(como.client, config, $container);
  }

  async start() {
    super.start();

    // 1. create a como player instance w/ a unique id (we default to the nodeId)
    const player = await this.como.project.createPlayer(this.como.client.id);
    player.subscribe(() => this.render());

    player.set({ metas: { type: this.client.type } });

    // 2. create a sensor source to be used within the graph.
    // We create a `RandomSource` if deviceMotion is not available for development
    // purpose, in most situations we might prefer to display a "sorry" screen
    let source;
    // @todo - finish decoupling `streamId` from `playerId`
    if (this.como.hasDeviceMotion) {
      source = new this.como.sources.DeviceMotion(this.como, player.get('id'));
    } else {
      source = new this.como.sources.RandomValues(this.como, player.get('id'), { period: 0.05 });
    }

    // @example - metas is a placeholder for application specific informations
    // player.set({
    //   metas: {
    //     index: this.services.checkin.state.get('index'),
    //     label: `niap-${this.services.checkin.state.get('index')}`,
    //   }
    // });

    // 3. bind everything together, the CoMoPlayer abstraction is just a shortcut
    // for binding player, sessions, and graph, triggering subscriptions when
    // anything change.
    this.coMoPlayer = new CoMoPlayer(this.como, player);
    this.coMoPlayer.setSource(source);

    // 4. react to gui controls.
    // @note - thse could be shared with the `designer`
    this.listeners = {
      // this one is needed for the enableCreation option
      createSession: async (sessionName, sessionPreset) => {
        const sessionId = await this.como.project.createSession(sessionName, sessionPreset);
        return sessionId;
      },
      setPlayerParams: async updates => await this.coMoPlayer.player.set(updates),
    };


    // subscribe for updates to render views
    this.coMoPlayer.onChange(() => this.render());
    // if we want to track the sessions that are created and deleted
    // e.g. when displaying the session choice screen
    this.como.project.subscribe(() => this.render());

    // console.warn('--> Attached to "test" session');
    // await this.coMoPlayer.player.set({ sessionId: 'test' });

    window.addEventListener('resize', () => this.render());
    this.render();
  }

  render() {
    const viewData = {
      config: this.config,
      project: this.como.project.getValues(),
      player: this.coMoPlayer.player.getValues(),
      session: this.coMoPlayer.session ? this.coMoPlayer.session.getValues() : null,
      boundingClientRect: this.$container.getBoundingClientRect(),
    };

    const listeners = this.listeners;
    const color = colors[this.coMoPlayer.player.get('id') % colors.length];
    let screen = ``;

    if (!this.como.hasDeviceMotion && !MOCK_SENSORS) {
      screen = views.sorry(viewData, listeners);
    } else if (viewData.player.loading) {
      screen = views.loading(viewData, listeners);
    } else if (this.coMoPlayer.session === null) {
      screen = views.manageSessions(viewData, listeners, {
        enableCreation: false,
        enableSelection: true,
      });
    } else {
      screen = views[this.client.type](viewData, listeners, {
        verbose: false,
        enableSelection: false,
      });
    }

    render(html`
      <div style="
        box-sizing: border-box;
        width: 100%;
        min-height: 100%;
        padding: 20px;
        background-color: ${color};
      ">
        ${screen}
      </div>
    `, this.$container);
  }
}

export default PlayerExperience;
