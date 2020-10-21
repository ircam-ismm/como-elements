import { html } from 'lit-html';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-text.js';

export function sessionHeader(data, listeners, {
  sessionId = null,
} = {}) {
  const session = data.sessions.get(sessionId).getValues();

  return html`
    <div style="
      position: relative;
      margin-top: 20px;
    ">
      <h3 style="
        height: 30px;
        line-height: 30px;
      ">> session
        <sc-text
          .value="${session.name}"
          @change="${e => listeners.setSessionParams(sessionId, { name: e.detail.value })}"
        ></sc-text>
      </h3>
      <sc-button
        value="Delete Session"
        style="
          position: absolute;
          right: 0;
          top: 0;
        "
        @release="${e => listeners.deleteSession(session.id)}"
      ></sc-button>
    </div>
  `;
}
