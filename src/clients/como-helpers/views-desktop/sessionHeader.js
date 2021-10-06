import { html } from 'lit-html';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-bang.js';

export function sessionHeader(data, listeners, {
  sessionId = null,
} = {}) {
  const session = data.sessions.get(sessionId).getValues();

  return html`
    <div style="
      position: relative;
      margin: 0 0 6px;
      background-color: #343434;
      padding: 4px;
    ">
      <h3 style="
        height: 30px;
        line-height: 30px;
        margin: 0;
      "># session
        <sc-text
          .value="${session.name}"
          @change="${e => listeners.setSessionParams(sessionId, { name: e.detail.value })}"
        ></sc-text>
      </h3>
      <div
        style="
          position: absolute;
          top: 4px;
          left: 300px;
        "
      >
        <sc-text
          readonly
          value="move all player to session"
        ></sc-text>
        <sc-bang
          @input="${e => listeners.assignPlayersToSession(session.id)}"
        ></sc-bang>
      </div>
      <sc-button
        value="Delete Session"
        style="
          position: absolute;
          right: 4px;
          top: 4px;
        "
        @release="${e => listeners.deleteSession(session.id)}"
      ></sc-button>
    </div>
  `;
}
