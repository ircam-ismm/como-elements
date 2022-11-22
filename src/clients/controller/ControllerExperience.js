import { AbstractExperience } from '@soundworks/core/client';
import { render, html, nothing } from 'lit/html.js';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';
import CoMoPlayer from '../como-helpers/CoMoPlayer';

import views from '../como-helpers/views-desktop/index.js';
// import stylesDesktop from '../como-helpers/views/stylesDesktop.js';

const HASH = window.location.hash.substring(1);

class ControllerExperience extends AbstractExperience {
  constructor(como, config, $container) {
    super(como.client);

    this.como = como;
    this.config = config;
    this.$container = $container;

    this.sessions = new Map();
    this.players = new Map();

    this.duplicatedCoMoPlayers = new Map(); // <playerId, CoMoPlayer>
    this.localCoMoPlayers = new Map(); // <playerId, CoMoPlayer>

    this.viewOptions = {
      layout: HASH === 'clients' ? 'clients' : 'full',
      openDirectories: (
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === 'localhost'
      ),
    }

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

    this.listeners = {
      setViewOption: (key, value) => {
        this.viewOptions[key] = value;
        this.render();
      },

      // manage sessions
      createSession: async (sessionName, sessionPreset) => {
        const sessionId = await this.como.project.createSession(sessionName, sessionPreset);
        return sessionId;
      },
      duplicateSession: async (sessionId) => {
        await this.como.project.duplicateSession(sessionId);
      },
      deleteSession: async sessionId => {
        await this.como.project.deleteSession(sessionId);
      },

      setSessionParams: async(sessionId, updates) => {
        const session = this.sessions.get(sessionId);
        await session.set(updates);
      },

      // graph options
      updateSessionGraphOptions: async (sessionId, moduleId, updates) => {
        const session = this.sessions.get(sessionId);
        session.setGraphOptions(moduleId, updates);
      },

      updatePlayerGraphOptions: async (playerId, moduleId, updates) => {
        const player = this.players.get(playerId);
        player.setGraphOptions(moduleId, updates);
      },

      createSessionLabel: async (sessionId, label) => {
        const session = this.sessions.get(sessionId);
        session.createLabel(label);
      },

      updateSessionLabel: async (sessionId, oldLabel, newLabel) => {
        const session = this.sessions.get(sessionId);
        session.updateLabel(oldLabel, newLabel);
      },

      deleteSessionLabel: async (sessionId, label) => {
        const session = this.sessions.get(sessionId);
        session.deleteLabel(label);
      },

      toggleSessionAudioFile: async (sessionId, filename, active) => {
        const session = this.sessions.get(sessionId);
        session.toggleAudioFile(filename, active);
      },

      createSessionLabelAudioFileRow: async (sessionId, row) => {
        const session = this.sessions.get(sessionId);
        session.createLabelAudioFileRow(row);
      },

      deleteSessionLabelAudioFileRow: async (sessionId, row) => {
        const session = this.sessions.get(sessionId);
        session.deleteLabelAudioFileRow(row);
      },

      // session examples
      deleteSessionExample: async (sessionId, exampleUuid) => {
        const session = this.sessions.get(sessionId);
        session.deleteExample(exampleUuid);
      },
      deleteSessionExamples: async (sessionId, label = null) => {
        const session = this.sessions.get(sessionId, label);
        session.clearExamples(label);
      },

      assignPlayersToSession: async (sessionId) => {
        for (let [id, player] of this.players.entries()) {
          player.set({ sessionId })
        }
      },

      // player
      setPlayerParams: async (playerId, updates) => {
        const player = this.players.get(playerId);
        await player.set(updates);
      },

      // duplicate
      duplicatePlayer: async (playerId, duplicate) => {
        if (duplicate) {
          // find player state and create sensor routing
          const player = this.players.get(playerId);
          const created = await this.como.project.createStreamRoute(playerId, this.como.client.id);

          if (created) {
            const source = new this.como.sources.Network(this.como, playerId);
            const coMoPlayer = new CoMoPlayer(this.como, player, true);
            coMoPlayer.setSource(source);
            coMoPlayer.createSessionAndGraph(player.get('sessionId'));

            this.duplicatedCoMoPlayers.set(playerId, coMoPlayer);
          }
        } else if (this.duplicatedCoMoPlayers.has(playerId)) {
          await this.como.project.deleteStreamRoute(playerId, this.como.client.id);

          const coMoPlayer = this.duplicatedCoMoPlayers.get(playerId);
          await coMoPlayer.delete();

          this.duplicatedCoMoPlayers.delete(playerId);
        }
      },

      openDirectory: (name) => {
        this.client.socket.send('open-directory', name);
      },
    };

    // ----------------------------------------------------
    // TRACK ALL SESSIONS
    // ----------------------------------------------------
    this.como.project.sessions.observe(async sessionId => {
      const session = await this.como.project.sessions.attach(sessionId);

      session.onDetach(() => {
        this.sessions.delete(sessionId);
        this.render();
      });

      session.subscribe(updates => this.render());

      this.sessions.set(sessionId, session);
      this.render();
    });

    // ----------------------------------------------------
    // TRACK ALL PLAYERS
    // ----------------------------------------------------
    this.como.project.players.observe(async (stateId, nodeId) => {
      const player = await this.como.project.players.attach(stateId, nodeId);
      const playerId = player.get('id');

      player.onDetach(() => {
        this.players.delete(playerId);
        this.render();
      });

      player.subscribe(updates => this.render());

      this.players.set(playerId, player);
      this.render();
    });

    // ----------------------------------------------------
    // TRACK SCRIPTS LIST
    // ----------------------------------------------------
    this.scriptsDataService.state.subscribe(() => this.render());
    this.scriptsAudioService.state.subscribe(() => this.render());

    window.addEventListener('resize', () => this.render());
    // initial render
    this.render();
  }

  render() {
    window.cancelAnimationFrame(this.rafId);

    this.rafId = window.requestAnimationFrame(() => {

      const project = this.como.project.getValues();
      const sessions = Array.from(this.sessions.values());
      const players = Array.from(this.players.values());

      sessions.sort((a, b) => a.get('id') < b.get('id') ? -1 : 1);
      players.sort((a, b) => a.get('id') < b.get('id') ? -1 : 1);

      const dataScriptList = this.scriptsDataService.getList();
      const audioScriptList = this.scriptsAudioService.getList();

      const viewData = {
        project: this.como.project.getValues(),
        sessions: this.sessions,
        players: this.players,
        dataScriptList: this.scriptsDataService.getList(),
        audioScriptList: this.scriptsAudioService.getList(),
        duplicatedCoMoPlayers: this.duplicatedCoMoPlayers,
        viewOptions: this.viewOptions,
      };

      const listeners = this.listeners;

      let screen = html`
        ${
          this.viewOptions.openDirectories ? html`
            <div style="
              position: fixed;
              bottom: 0;
              right: 0;
              padding: 10px;
              background-color: rgba(255, 255, 255, 0.2);
              z-index: 10;
            ">
              <sc-button
                @input=${e => this.listeners.openDirectory('audio')}
                value="open audio directory"
                width="300"
              ></sc-button>
            </div>
          ` : nothing}

        ${views.overviewInfos(viewData, listeners)}

        ${this.viewOptions.layout === 'full' ?
          views.createSessions(viewData, listeners)
        : ``}

        ${this.viewOptions.layout === 'clients' ?
          html`<div>
            <h2>Connected Clients</h2>

            ${Array.from(this.players.keys()).sort((a, b) => a - b).map(playerId => {
              return views.playerControls(viewData, listeners, {
                playerId,
                showMetas: false,
                showRecordingControls: false,
                showDuplicate: true,
                showRecordStream: false,
                showAudioControls: true,
                showScriptsControls: true,
              });
            })}
          </div>`
        : ``}
        <div>
          <h2>Sessions</h2>

          ${Array.from(this.sessions.keys()).sort().map(sessionId => {
            return html`
              <div style="
                background-color: #181818;
                padding: 4px;
                margin-top: 20px;
              ">
                ${views.sessionHeader(viewData, listeners, { sessionId })}
                <div style="display:none;">
                  ${views.graphOptionsControls(viewData, listeners, {
                    sessionId,
                    showScriptsControls: (this.viewOptions.layout === 'full'),
                  })}

                  ${this.viewOptions.layout === 'full' ?
                    html`
                      ${views.sessionLearning(viewData, listeners, { sessionId })}
                      ${views.sessionLabelsAndAudioFiles(viewData, listeners, { sessionId })}
                      ${views.sessionPlayers(viewData, listeners, { sessionId })}
                    `
                  : ``}
                </div>
              </div>
            `;
          })}
        <div>

        ${this.viewOptions.layout === 'full' ?
          html`<div>
            <h2>Connected Clients</h2>

            ${Array.from(this.players.keys()).sort((a, b) => a - b).map(playerId => {
              return views.playerControls(viewData, listeners, {
                playerId,
                showMetas: false,
                showRecordingControls: false,
                showDuplicate: false,
                showRecordStream: false,
                showAudioControls: false,
                showScriptsControls: false,
              });
            })}
          </div>`
        : ``}
      `;

      render(html`
        <div style="
          box-sizing: border-box;
          padding: 10px;
          min-height: 100%;
          padding-bottom: 100px;
        ">
          ${screen}
        </div>
      `, this.$container);
    });
  }
}


export default ControllerExperience;
