import { html } from 'lit/html.js';
import * as styles from './styles.js';
import { graphOptionsControls } from './graphOptionsControls.js'
import '@ircam/simple-components/sc-toggle.js';
import '@ircam/simple-components/sc-text.js';

import colors from '../gui-colors.js';

export function playerControls(data, listeners, {
  playerId = null,
  showMetas = true,
  showRecordingControls = true,
  showDuplicate = true,
  showRecordStream = true,
  showAudioControls = true,
  showScriptsControls = true,
} = {}) {
  const sessions = Array.from(data.sessions.values());
  const player = data.players.get(playerId).getValues();
  const sessionId = player.sessionId;
  const session = data.sessions.get(player.sessionId);

  return html`
    <div style="
      padding: 10px;
      background-color: #464646;
      margin-bottom: 6px;
      position: relative;
      overflow: auto;
    ">
      <h4 style="
        height: 30px;
        line-height: 30px;
        margin: 4px 0;
      ">
        <div
          style="
            display: inline-block;
            height: 30px;
            line-height: 30px;
            width: 30px;
            text-align: center;
            font-size: 12px;
            margin-right: 20px;
            background-color: ${player.metas.type === 'player' ?
              colors[player.id % colors.length] : '#000000'
            };
          "
        >${player.metas.type === 'player' ? '' : player.id}</div>
        <span style="display: inline-block; width: 300px; font-size: 12px; vertical-align: top">
          ${player.metas.type || 'player'} - (id: ${player.id})
        </span>
        <label style="position: absolute; right: 10px;">
          attach to session:
          <select
            style="${styles.select}"
            @change="${e => listeners.setPlayerParams(player.id, { 'sessionId': e.target.value || null })}"
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
      </h4>

      <!--
      ${showMetas ?
        html`
          <p style="font-style: italic; margin: 4px 0 8px;">
            metas: ${JSON.stringify(player.metas)}
          </p>`
      : ``}
      -->

      ${showRecordingControls && session ?
        html`
          <!-- RECORDING -->
          <div style="margin-bottom: 4px;">
            <sc-text
              value="label"
              width="80"
              readonly
            ></sc-text>
            <select
              style="${styles.select}"
              @change="${e => listeners.setPlayerParams(player.id, { label: e.target.value })}"
            >
              <!-- @TODO - change when files and labels are decoupled -->
              ${session.get('labels')
                .sort()
                .map(label => {
                  return html`
                    <option
                      value="${label}"
                      ?selected="${player.label === label}"
                    >${label}</option>`
                })}
            </select>

            <sc-text
              value="preview"
              width="80"
              readonly
            ></sc-text>
            <sc-toggle
              .active="${player.preview}"
              @change="${e => listeners.setPlayerParams(player.id, { preview: e.detail.value })}"
            ></sc-toggle>

            ${player.recordingState === 'idle'
              ? html`
                <sc-button
                  value="arm"
                  @click="${e => listeners.setPlayerParams(player.id, { recordingState: 'armed' })}"
                ></sc-button>`
              : ``}

            ${player.recordingState === 'armed'
              ? html`
                <sc-button
                  value="start recording"
                  @click="${e => listeners.setPlayerParams(player.id, { recordingState: 'recording' })}"
                ></sc-button>`
              : ``}

            ${player.recordingState === 'recording'
              ? html`
                <sc-button
                  value="stop recording"
                  @click="${e => listeners.setPlayerParams(player.id, { recordingState: 'pending' })}"
                ></sc-button>`
              : ``}

            ${player.recordingState === 'pending'
              ? html`
                <sc-button
                  value="confirm"
                  @click="${e => listeners.setPlayerParams(player.id, { recordingState: 'confirm' })}"
                ></sc-button>
                <sc-button
                  value="cancel"
                  @click="${e => listeners.setPlayerParams(player.id, { recordingState: 'cancel' })}"
                ></sc-button>`
              : ``}
          </div>`
      : ``}

      ${showDuplicate ?
        html`
          <div style="margin-bottom: 4px; ${data.viewOptions.layout === 'clients' ? 'float:left; margin-right: 12px' : ''}">
            <sc-text
              value="duplicate"
              width="200"
              readonly
            ></sc-text>
            <sc-toggle
              .active="${data.duplicatedCoMoPlayers.has(player.id)}"
              @change="${e => listeners.duplicatePlayer(player.id, e.detail.value)}"
            ></sc-toggle>
          </div>`
      : ``}

      ${showRecordStream ?
        html`
          <div style="margin-bottom: 4px;">
            <sc-text
              value="record stream"
              width="200"
              readonly
            ></sc-text>
            <sc-toggle
              .active="${player.streamRecord}"
              @change="${e => listeners.setPlayerParams(player.id, { streamRecord: e.detail.value })}"
            ></sc-toggle>
          </div>`
      : ``}

      ${graphOptionsControls(data, listeners, {
        sessionId,
        playerId,
        showAudioControls,
        showScriptsControls,
      })}
      </div>
  `;
}
