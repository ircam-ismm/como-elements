import { AbstractExperience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';
import CoMoPlayer from '../como-helpers/CoMoPlayer';

import views from '../como-helpers/views-desktop/index.js';
// import stylesDesktop from '../como-helpers/views/stylesDesktop.js';

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
      layout: 'full', // 'clients'
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
      // manager sessions
      createSession: async (sessionName, sessionPreset) => {
        const sessionId = await this.como.project.createSession(sessionName, sessionPreset);
        return sessionId;
      },
      deleteSession: async sessionId => {
        await this.como.project.deleteSession(sessionId);
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

      // session examples
      deleteSessionExample: async (sessionId, exampleUuid) => {
        const session = this.sessions.get(sessionId);
        session.deleteExample(exampleUuid);
      },
      deleteAllSessionExamples: async (sessionId) => {
        const session = this.sessions.get(sessionId);
        session.clearExamples();
      },
      deleteSessionExamplesByLabel: async (sessionId, label) => {
        const session = this.sessions.get(sessionId);
        session.clearLabel(label);
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
          await coMoPlayer.clearSessionAndGraph();

          this.duplicatedCoMoPlayers.delete(playerId);
        }
      },

      // 'session:updateAudioFiles': async e => {
      //   e.preventDefault();
      //   const formData = new FormData(e.target);

      //   const sessionId = formData.get('id');
      //   const session = this.sessions.get(sessionId);

      //   const audioFiles = session.get('audioFiles');
      //   const index = formData.get('index');
      //   audioFiles[index].active = formData.get('active') ? true : false;
      //   audioFiles[index].label = formData.get('label');
      //   session.set({ audioFiles });
      // },

      // // local players
      // 'localPlayer:create': async () => {
      //   this._createLocalPlayer();
      // },

      // 'localPlayer:setSource': async (playerId, sourceId) => {
      //   this._setLocalPlayerSource(playerId, sourceId);
      // },
    };

    // ----------------------------------------------------
    // TRACK ALL SESSIONS
    // ----------------------------------------------------
    this.como.project.sessions.observe(async (stateId) => {
      const session = await this.como.project.sessions.attach(stateId);
      const sessionId = session.get('id');

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

  // @note - keep this for later refactor (cf. Iseline)
  // async _createLocalPlayer() {
  //   const playerId = 1000 + this.localCoMoPlayers.size;
  //   const player = await this.como.project.createPlayer(playerId);
  //   const coMoPlayer = new CoMoPlayer(this.como, player);

  //   this.localCoMoPlayers.set(playerId, coMoPlayer);
  //   return coMoPlayer;
  // }

  // async _setLocalPlayerSource(playerId, sourceId = null) {
  //   const coMoPlayer = this.localCoMoPlayers.get(playerId);
  //   // delete old route if any
  //   if (coMoPlayer.source) {
  //     const prevSourceId = coMoPlayer.source.streamId;
  //     await this.como.project.deleteStreamRoute(prevSourceId, this.como.client.id);
  //   }

  //   if (sourceId) {
  //     // console.log('create stream', sourceId, this.como.client.id);
  //     const created = await this.como.project.createStreamRoute(sourceId, this.como.client.id);

  //     if (created) {
  //       // console.log('create created');
  //       const source = new this.como.sources.Network(this.como, sourceId);
  //       coMoPlayer.setSource(source);
  //     }
  //   }
  // }

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
      };

      const listeners = this.listeners;

      let screen = html`

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
                showGraphOptionsControls: false,
              });
            })}
          </div>`
        : ``}
        <div>
          <h2>Sessions</h2>

          ${Array.from(this.sessions.keys()).sort().map(sessionId => {
            return html`
              ${views.sessionHeader(viewData, listeners, { sessionId })}
              ${views.graphOptionsControls(viewData, listeners, {
                sessionId,
                showScriptsControls: (this.viewOptions.layout === 'full'),
              })}

              ${this.viewOptions.layout === 'full' ?
                html`
                  ${views.sessionMLExamples(viewData, listeners, { sessionId })}
                  ${views.sessionPlayers(viewData, listeners, { sessionId })}
                `
              : ``}
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
                showGraphOptionsControls: false,
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
        ">
          ${screen}
        </div>
      `, this.$container);
    });
  }
}

/*
  <div style="margin: 10px 0">
    <h2 style="font-size: 14px">> audio files</h2>
    ${session.audioFiles.map((audioFile, index) => {
      return html`
        <form
          @submit="${this.listeners['session:updateAudioFiles']}"
        >
          <input type="hidden" name="id" value="${session.id}" />
          <input type="hidden" name="index" value="${index}" />
          <input type="hidden" name="url" value="${audioFile.url}" />
          <span>${audioFile.name}</span>
          <label>
            active
            <input
              type="checkbox"
              name="active"
              ?checked="${audioFile.active}"
            />
          </label>
          <label>
            label
            <input
              type="text"
              name="label"
              .value="${audioFile.label}"
            />
          </label>
          <input type="submit" value="save" />
        </form>
      `;
    })}
*/

export default ControllerExperience;
