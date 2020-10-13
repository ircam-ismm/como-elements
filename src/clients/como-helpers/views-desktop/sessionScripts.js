import { html } from 'lit-html';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-toggle.js';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-button.js';

export function sessionScripts(data, listeners, {
  sessionId = null,
}) {
  const session = data.sessions.get(sessionId).getValues();
  const dataScripts = session.graph.modules.filter(m => m.type === 'ScriptData');
  const audioScripts = session.graph.modules.filter(m => m.type === 'ScriptAudio');

  return html`
    <div>

      <h3 style="${styles.h3}">Data Scripts</h3>

      ${dataScripts.map(scriptModule => {
        return html`
          <div style="margin-bottom: 2px">
            <sc-text
              value="${scriptModule.id}"
              readonly
            ></sc-text>
            <select
              style="${styles.select}"
              @change="${e => listeners.updateSessionGraphOption(session.id, scriptModule.id, 'scriptName', e.target.value)}"
            >
              ${data.dataScriptList.map(scriptName => {
                return html`<option
                  value="${scriptName}"
                  ?selected="${scriptName === scriptModule.options.scriptName}"
                >${scriptName}</option>`;
              })}
            </select>
            <sc-button
              value="edit"
              width= "100"
              @input="${e => {
                const url = `../script-editor#data___${scriptModule.options.scriptName}`;
                window.open(url, '', 'width=1000,height=750,top=200,left=200');
              }}"
            ></sc-button>
          </div>
        `;
      })}


      <h3 style="${styles.h3}">Audio Scripts</h3>

      ${audioScripts.map(scriptModule => {
        return html`
          <div style="margin-bottom: 2px">
            <sc-text
              value="${scriptModule.id}"
              readonly
            ></sc-text>
            <select
              style="${styles.select}"
              @change="${e => listeners.updateSessionGraphOption(session.id, scriptModule.id, 'scriptName', e.target.value)}"
            >
              ${data.audioScriptList.map(scriptName => {
                return html`<option
                  value="${scriptName}"
                  ?selected="${scriptName === scriptModule.options.scriptName}"
                >${scriptName}</option>`;
              })}
            </select>
            <sc-button
              value="edit"
              width= "100"
              @input="${e => {
                const url = `../script-editor#audio___${scriptModule.options.scriptName}`;
                window.open(url, '', 'width=1000,height=750,top=200,left=200');
              }}"
            ></sc-button>
            <sc-text
              value="bypass"
              width="60"
              readonly
            ></sc-text>
            <sc-toggle
              .active="${scriptModule.options.bypass}"
              @change="${e => listeners.updateSessionGraphOption(session.id, scriptModule.id, 'bypass', e.detail.value)}"
            ></sc-toggle>
          </div>
        `;
      })}

    </div>
  `;
}
