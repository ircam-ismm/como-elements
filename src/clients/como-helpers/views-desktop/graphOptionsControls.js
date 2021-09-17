import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-toggle.js';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-slider.js';

export function graphOptionsControls(data, listeners, {
  sessionId = null,
  playerId = null,
  showAudioControls = true,
  showScriptsControls = true,
} = {}) {
  // this might be called by a player attached to a session before the session is actually attached
  if (!data.sessions.has(sessionId)) {
    return ``;
  }

  const session = data.sessions.get(sessionId).getValues();
  const destinationId = session.graph.audio.modules.find(m => m.type === 'AudioDestination').id;
  const dataScripts = session.graph.data.modules.filter(m => m.type === 'ScriptData');
  const audioScripts = session.graph.audio.modules.filter(m => m.type === 'ScriptAudio');

  let player = null;

  if (playerId) {
    player = data.players.get(playerId).getValues();
  }

  const targetId = player ? playerId : sessionId;
  const graphOptions = player ? player.graphOptions : session.graphOptions;
  const updateGraphFunc = player ?
    listeners.updatePlayerGraphOptions : listeners.updateSessionGraphOptions;

  return html`
    <div>
      ${showAudioControls ?
        html`
          <div>
            <sc-text
              value="volume"
              width="80"
              readonly
            ></sc-text>
            <sc-slider
              width="300"
              min="-60"
              max="5"
              step="1"
              display-number
              .value="${graphOptions[destinationId].volume}"
              @input="${e => updateGraphFunc(targetId, destinationId, { volume: e.detail.value })}"
            ></sc-slider>
            <sc-text
              value="mute"
              width="80"
              readonly
            ></sc-text>
            <sc-toggle
              .active="${graphOptions[destinationId].mute}"
              @change="${e => updateGraphFunc(targetId, destinationId, { mute: e.detail.value })}"
            ></sc-toggle>
          </div>
        ` : ``
      }

      ${showScriptsControls ?
        html`
          <h3 style="${styles.h3}">Data Scripts</h3>

          ${dataScripts.map(scriptModule => {
            const scriptOptions = graphOptions[scriptModule.id];

            return html`
              <div style="margin-bottom: 2px">
                <sc-text
                  value="${scriptModule.id}"
                  readonly
                ></sc-text>
                <select
                  style="${styles.select}"
                  @change="${e => updateGraphFunc(targetId, scriptModule.id, { scriptName: e.target.value })}"
                >
                  ${data.dataScriptList.map(scriptName => {
                    return html`<option
                      value="${scriptName}"
                      ?selected="${scriptName === scriptOptions.scriptName}"
                    >${scriptName}</option>`;
                  })}
                </select>
                <sc-button
                  value="edit"
                  width= "100"
                  @input="${e => {
                    const url = `../script-editor#data___${scriptOptions.scriptName}`;
                    window.open(url, '', 'width=1000,height=750,top=200,left=200');
                  }}"
                ></sc-button>
                <sc-text
                  .value="${scriptOptions.scriptParams || ''}"
                  @change="${e => updateGraphFunc(targetId, scriptModule.id, { scriptParams: e.detail.value })}"
                ></sc-text>
              </div>
            `;
          })}


          <h3 style="${styles.h3}">Audio Scripts</h3>

          ${audioScripts.map(scriptModule => {
            const scriptOptions = graphOptions[scriptModule.id];

            return html`
              <div style="margin-bottom: 2px">
                <sc-text
                  value="${scriptModule.id}"
                  readonly
                ></sc-text>
                <select
                  style="${styles.select}"
                  @change="${e => updateGraphFunc(targetId, scriptModule.id, { scriptName: e.target.value })}"
                >
                  ${data.audioScriptList.map(scriptName => {
                    return html`<option
                      value="${scriptName}"
                      ?selected="${scriptName === scriptOptions.scriptName}"
                    >${scriptName}</option>`;
                  })}
                </select>
                <sc-button
                  value="edit"
                  width= "100"
                  @input="${e => {
                    const url = `../script-editor#audio___${scriptOptions.scriptName}`;
                    window.open(url, '', 'width=1000,height=750,top=200,left=200');
                  }}"
                ></sc-button>
                <sc-text
                  value="bypass"
                  width="60"
                  readonly
                ></sc-text>
                <sc-toggle
                  .active="${scriptOptions.bypass}"
                  @change="${e => updateGraphFunc(targetId, scriptModule.id, { bypass: e.detail.value })}"
                ></sc-toggle>
                <sc-text
                  .value="${scriptOptions.scriptParams || ''}"
                  @change="${e => updateGraphFunc(targetId, scriptModule.id, { scriptParams: e.detail.value })}"
                ></sc-text>
              </div>
            `;
          })}
        ` : ``}

    </div>
  `;
}
