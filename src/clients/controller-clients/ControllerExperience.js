import { AbstractExperience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';
import CoMoPlayer from '../como-helpers/CoMoPlayer';

class ControllerExperience extends AbstractExperience {
  constructor(como, config, $container) {
    super(como.client);

    this.como = como;
    this.config = config;
    this.$container = $container;

    this.sessions = new Map();
    this.players = new Map();

    this.remoteCoMoPlayers = new Map(); // <playerId, CoMoPlayer>
    this.localCoMoPlayers = new Map(); // <playerId, CoMoPlayer>

    como.configureExperience(this, {
      // bypass some plugins if not needed
      checkin: false,
    });

    renderInitializationScreens(como.client, config, $container);
  }

  async start() {
    super.start();

    // we need these to diplay the list of available scripts
    this.scriptsDataService = this.como.experience.plugins['scripts-data'];
    this.scriptsAudioService = this.como.experience.plugins['scripts-audio'];

    this.eventListeners = {
      'project:createSession': async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const sessionName = formData.get('session-name').trim();
        const sessionPreset = formData.get('session-preset');

        if (sessionName && sessionPreset) {
          const uuid = await this.como.project.createSession(sessionName, sessionPreset);
          e.target.reset();
        }
      },
      'project:deleteSession': async sessionId => {
        await this.como.project.deleteSession(sessionId);
      },

      'session:updateAudioFiles': async e => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const sessionId = formData.get('id');
        const session = this.sessions.get(sessionId);

        const audioFiles = session.get('audioFiles');
        const index = formData.get('index');
        audioFiles[index].active = formData.get('active') ? true : false;
        audioFiles[index].label = formData.get('label');
        session.set({ audioFiles });
      },
      'session:updateGraphOption': async (sessionId, moduleId, optionName, value) => {
        const session = this.sessions.get(sessionId);
        const graph = session.get('graph');
        const module = graph.modules.find(m => m.id === moduleId);
        module.options[optionName] = value;

        session.set({ graph });
      },

      'session:deleteExample': async (sessionId, exampleUuid) => {
        const session = this.sessions.get(sessionId);
        session.deleteExample(exampleUuid);
      },
      'session:clearExamples': async (sessionId) => {
        const session = this.sessions.get(sessionId);
        session.clearExamples();
      },
      'session:clearLabel': async (sessionId, label) => {
        const session = this.sessions.get(sessionId);
        session.clearLabel(label);
      },

      // @todo - merge all these
      'player:set': async (playerId, name, value) => {
        const player = this.players.get(playerId);
        player.set({ [name]: value });
      },


      // duplicate
      'player:duplicate': async (playerId, toggle) => {
        this._duplicatePlayer(playerId, toggle);
      },

      // local players
      'localPlayer:create': async () => {
        this._createLocalPlayer();
      },

      'localPlayer:setSource': async (playerId, sourceId) => {
        this._setLocalPlayerSource(playerId, sourceId);
      },
    };

    // ----------------------------------------------------
    // TRACK ALL SESSIONS
    // ----------------------------------------------------
    this.como.project.sessions.observe(async (stateId) => {
      const session = await this.como.project.sessions.attach(stateId);
      const sessionId = session.get('id');

      session.onDetach(() => {
        this.sessions.delete(sessionId);
        this.renderApp();
      });

      session.subscribe(updates => this.renderApp());

      this.sessions.set(sessionId, session);
      this.renderApp();
    });

    // ----------------------------------------------------
    // TRACK ALL PLAYERS
    // ----------------------------------------------------
    this.como.project.players.observe(async (stateId, nodeId) => {
      const player = await this.como.project.players.attach(stateId, nodeId);
      const playerId = player.get('id');

      player.onDetach(() => {
        this.players.delete(playerId);
        this.renderApp();
      });

      player.subscribe(updates => this.renderApp());

      this.players.set(playerId, player);
      this.renderApp();
    });

    // ----------------------------------------------------
    // TRACK SCRIPTS LIST
    // ----------------------------------------------------
    this.scriptsDataService.state.subscribe(() => this.renderApp());
    this.scriptsAudioService.state.subscribe(() => this.renderApp());

    // initial render
    this.renderApp();
  }

  // @note - this might change in the future because we might want to duplicate a
  // single player from a client that would have instanciated several of them...
  async _duplicatePlayer(playerId, toggle) {
    if (toggle) {
      // find player state and create sensor routing
      const player = this.players.get(playerId);
      const created = await this.como.project.createStreamRoute(playerId, this.como.client.id);

      if (created) {
        const source = new this.como.sources.Network(this.como, playerId);
        const coMoPlayer = new CoMoPlayer(this.como, player);
        coMoPlayer.setSource(source);
        coMoPlayer.createSessionAndGraph(player.get('sessionId'));

        this.remoteCoMoPlayers.set(playerId, coMoPlayer);
      }
    } else {
      await this.como.project.deleteStreamRoute(playerId, this.como.client.id);

      const coMoPlayer = this.remoteCoMoPlayers.get(playerId);
      await coMoPlayer.clearSessionAndGraph();

      this.remoteCoMoPlayers.delete(playerId);
    }
  }

  async _createLocalPlayer() {
    const playerId = 1000 + this.localCoMoPlayers.size;
    const player = await this.como.project.createPlayer(playerId);
    const coMoPlayer = new CoMoPlayer(this.como, player);

    this.localCoMoPlayers.set(playerId, coMoPlayer);
  }

  async _setLocalPlayerSource(playerId, sourceId = null) {
    console.log(sourceId);
    const coMoPlayer = this.localCoMoPlayers.get(playerId);
    // delete old route if any
    if (coMoPlayer.source) {
      const prevSourceId = coMoPlayer.source.streamId;
      await this.como.project.deleteStreamRoute(prevSourceId, this.como.client.id);
    }

    if (sourceId) {
      console.log('create stream', sourceId, this.como.client.id);
      const created = await this.como.project.createStreamRoute(sourceId, this.como.client.id);

      if (created) {
        console.log('create created');
        const source = new this.como.sources.Network(this.como, sourceId);
        coMoPlayer.setSource(source);
      }
    }
  }

  renderApp() {
    window.cancelAnimationFrame(this.rafId);

    this.rafId = window.requestAnimationFrame(() => {
      const project = this.como.project.getValues();
      const sessions = Array.from(this.sessions.values());
      const players = Array.from(this.players.values());

      sessions.sort((a, b) => a.get('id') < b.get('id') ? -1 : 1);
      players.sort((a, b) => a.get('id') < b.get('id') ? -1 : 1);

      // scripts list
      const dataScriptList = this.scriptsDataService.state.get('list');
      const audioScriptList = this.scriptsAudioService.state.get('list');

      render(html`
        <!-- GENERAL -->
        <div class="screen" style="box-sizing: border-box; padding: 20px;">
          ${project.audioFiles.map(file => {
            // return html`<p>${JSON.stringify(file)}</p>`;
          })}

          <div style="margin: 10px 0;">
            <p># sessions: ${sessions.length}</p>
            <p># players: ${players.length}</p>
          </div>

        <!-- PLAYER LIST -->
          <div style="margin: 10px 0">
            <h1 style="font-size: 16px">Players: </h1>
            <ul>
            ${players.map(playerState => {
              const player = playerState.getValues();

              return html`<li>
                <p>
                  > ${player.id}
                </p>
                <label>
                  attach to session
                  <select
                    @change="${e => this.eventListeners['player:set'](player.id, 'sessionId', e.target.value || null)}"
                  >
                    <option value="">select session</option>
                    ${sessions.map((session) => {
                      return html`
                        <option
                          value="${session.get('id')}"
                          ?selected="${player.sessionId === session.get('id')}"
                        >${session.get('name')}</option>`
                    })}
                  </select>
                </label>
              </li>`;
            })}
            </ul>
          </div>

          <hr />

          <!-- SESSIONS -->
          <div style="margin: 10px 0;">
          <li style="margin: 14px 0">
            <ul>
            ${sessions.map((s) => {
              const session = s.getValues();
              const sessionPlayers = players.filter(p => p.get('sessionId') === session.id);

              return html`
                <li style="margin: 14px 0">
                  <h1 style="font-size: 16px">Session: "${session.name}"</h1>
                  id: ${session.id},
                  stateId: ${s.state.id} |

                  <div style="margin: 10px 0">

                    ${session.graph.modules.map(module => {
                      switch (module.type) {
                        case 'AudioDestination':
                          return html`
                            <h2 style="font-size: 14px">> volume</h2>
                            <label style="display: block;">
                              ${module.id} -
                              volume: <input
                                type="range"
                                min="-60"
                                max="6"
                                .value="${module.options.volume}"
                                @input="${e => this.eventListeners['session:updateGraphOption'](session.id, module.id, 'volume', parseInt(e.target.value))}"
                              />
                              </select>
                              | mute
                              <input
                                type="checkbox"
                                .checked="${module.options.mute}"
                                @change="${e => this.eventListeners['session:updateGraphOption'](session.id, module.id, 'mute', !!e.target.checked)}"
                              />
                          `;
                          break;
                      }
                    })}
                  </div>


                  <!-- ATTACHED PLAYERS MANAGEMENT -->
                  <div style="margin: 10px 0">
                    <h2 style="font-size: 14px">> players</h2>
                    ${sessionPlayers.map(playerState => {
                      const player = playerState.getValues();

                      return html`
                        <p>
                          >> ${player.id}
                          - (metas: ${JSON.stringify(player.metas)})
                          - ${player.loading ? `loading` : ''}
                        </p>
                        <label>
                          attach to session:
                          <select
                            @change="${e => this.eventListeners['player:set'](player.id, 'sessionId', e.target.value || null)}"
                          >
                            <option value="">select session</option>
                            ${sessions.map((session) => {
                              return html`
                                <option
                                  value="${session.get('id')}"
                                  ?selected="${player.sessionId === session.id}"
                                >${session.get('name')}</option>`
                            })}
                          </select>
                        </label>

                        ${player.id >= 1000 ?
                          html`
                            <label>
                              source id
                              <input
                                type="number"
                                min="0"
                                step="1"
                                .value="${this.localCoMoPlayers.has(player.id).source && this.localCoMoPlayers.has(player.id).source.streamId}"
                                @change="${e => this.eventListeners['localPlayer:setSource'](player.id, parseInt(e.target.value) || null)}"
                              />
                            </label>
                          ` :
                          html`
                            <div>
                              duplicate
                              <input type="checkbox"
                                .checked="${this.remoteCoMoPlayers.has(player.id)}"
                                @change="${e => this.eventListeners['player:duplicate'](player.id, !!e.target.checked)}"
                              />
                            </div>
                          `
                        }
                      `;
                    })}
                    <!-- end players -->
                  </div>

                  <hr style="outline: 1px #cdcdcd dotted; height: 1px; border: none; margin-top: 10px" />
                </li>`;
            })}
            </ul>
          </div>

          <hr />



          <!-- LOCAL PLAYERS -->
          <div style="margin: 10px 0">
            <button
              @click="${this.eventListeners['localPlayer:create']}"
            >
              Create Local Player
            </button>
          </div>

        </div>
      `, this.$container);
    });
  }
}

export default ControllerExperience;
