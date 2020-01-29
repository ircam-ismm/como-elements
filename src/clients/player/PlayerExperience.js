import { Experience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import renderAppInitialization from '../views/renderAppInitialization';
import CoMoPlayer from '../como-helpers/CoMoPlayer';

class PlayerExperience extends Experience {
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
    renderAppInitialization(como.client, config, $container);
  }

  async start() {
    super.start();
    // console.log('hasDeviceMotion', this.como.hasDeviceMotion);

    // 1. create a como player instance w/ a unique id (we default to the nodeId)
    const player = await this.como.project.createPlayer(this.como.client.id);

    // 2. create a sensor source to be used within the graph.
    // We create a `RandomSource` if deviceMotion is not available for development
    // purpose, in most situations we might prefer to display a "sorry" screen
    let source;
    // @todo - finish decoupling `streamId` from `playerId`
    if (this.como.hasDeviceMotion) {
      source = new this.como.sources.DeviceMotion(this.como, player.get('id'));
    } else {
      source = new this.como.sources.RandomValues(this.como, player.get('id'));
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
    this.eventListeners = {
      'project:createAndSetSession': async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const sessionName = formData.get('session-name').trim();
        const sessionPreset = formData.get('session-preset');

        if (sessionName && sessionPreset) {
          const id = await this.como.project.createSession(sessionName, sessionPreset);
          e.target.reset();
          // set newly created session to player
          this.coMoPlayer.player.set({ sessionId: id });
        }
      },
      'player:set': updates => this.coMoPlayer.player.set(updates),
    };

    // subscribe for updates to render views
    this.coMoPlayer.onChange(() => this.renderApp());
    // if we want to track the sessions that are created and deleted
    // e.g. when displaying the session choice screen
    this.como.project.subscribe(() => this.renderApp());

    // force loading first session of the list
    // const sessionsOverview = this.como.project.get('sessionsOverview');

    // if (sessionsOverview[0]) {
    //   const sessionId = sessionsOverview[0].id;
    //   this.coMoPlayer.player.set({ sessionId: sessionId });
    // }

    // this.coMoPlayer.player.set({ sessionId: 'session-1' });

    this.renderApp();
  }

  renderApp() {
    let $screen;

    const project = this.como.project.getValues();

    const player = this.coMoPlayer.player.getValues();
    const session = this.coMoPlayer.session ? this.coMoPlayer.session.getValues() : null;

    if (session === null) {

      $screen = html`
        <div class="screen" style="box-sizing: border-box; padding: 20px; overflow: auto;">
          <form
            @submit="${this.eventListeners['project:createAndSetSession']}"
          >
            <h1>create session</h1>
            <input type="text" name="session-name" />
            <select name="session-preset">
              <option value="" selected>select preset</option>
              ${project.presetNames.map(presetName => {
                return html`<option value="${presetName}">${presetName}</option>`;
              })}
            </select>
            <input type="submit" value="Create Session" />
          </form>

          <select
            @change="${e => this.eventListeners['player:set']({ sessionId: e.target.value || null })}"
          >
            <option value="">select session</option>
            ${project.sessionsOverview.map((session) => {
              return html`<option value="${session.id}">${session.name}</option>`;
            })}
          </select>
        </div>`;

    } else {

      $screen = html`
        ${player.loading ? html`
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 50px; line-height: 50px; background-color: white; color: #232323; text-align: center">Loading session</div>
        ` : ''}
        <div class="screen" style="box-sizing: border-box; padding: 20px; overflow: auto;">
          <button @click="${() => this.eventListeners['player:set']({ sessionId: null })}">
            change session
          </button>
          <div style="margin: 10px 0;">
            <label
              @change="${e => this.eventListeners['player:set']({ label: e.target.value })}"
            >
              Recording
              <!-- @todo - this should also filter "active" files -->
              <select>
                ${session.audioFiles
                  .map(file => file.label)
                  .filter((label, index, arr) => arr.indexOf(label) === index)
                  .sort()
                  .map(label => {
                    return html`
                      <option
                        value="${label}"
                        ?selected="${player.label === label}"
                      >${label}</option>`
                  })
                }
              </select>
            </label>

            ${player.recordingState === 'idle'
              ? html`<button @click="${e => this.eventListeners['player:set']({ recordingState: 'armed' })}">idle</button>`
              : ``}

            ${player.recordingState === 'armed'
              ? html`<button @click="${e => this.eventListeners['player:set']({ recordingState: 'recording' })}">record</button>`
              : ``}

            ${player.recordingState === 'recording'
              ? html`<button @click="${e => this.eventListeners['player:set']({ recordingState: 'pending' })}">stop</button>`
              : ``}

            ${player.recordingState === 'pending'
              ? html`
                <button @click="${e => this.eventListeners['player:set']({ recordingState: 'confirm' })}">confirm</button>
                <button @click="${e => this.eventListeners['player:set']({ recordingState: 'cancel' })}">cancel</button>`
              : ``}

          </div>
          <pre>
            <code>
> player:
${JSON.stringify(player, null, 2)}
            </code>
            <code>
${session ? `> session: "${session.name}"` : null}
${session ? `> graph: \n${JSON.stringify(session.graph, null, 2)}` : null}
            </code>
          </pre>
        </div>`;
    }

    render($screen, this.$container);
  }
}

export default PlayerExperience;
