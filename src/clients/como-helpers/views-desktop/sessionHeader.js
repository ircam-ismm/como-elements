import { html } from 'lit-html';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-slider.js';
import '@ircam/simple-components/sc-toggle.js';
import '@ircam/simple-components/sc-text.js';

export function sessionHeader(data, listeners, {
  sessionId = null,
}) {
  const session = data.sessions.get(sessionId).getValues();
  const audioDestination = session.graph.modules.find(m => m.type === 'AudioDestination');

  return html`
    <div style="
      position: relative;
      margin-top: 20px;
    ">
      <h3 style="
        height: 24px;
        line-height: 24px;
      ">> session "${session.name}"</h3>
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
        .value="${audioDestination.options.volume}"
        @input="${e => listeners.updateSessionGraphOption(sessionId, audioDestination.id, 'volume', e.detail.value)}"
      ></sc-slider>
      <sc-text
        value="mute"
        width="80"
        readonly
      ></sc-text>
      <sc-toggle
        .active="${audioDestination.options.mute}"
        @change="${e => listeners.updateSessionGraphOption(sessionId, audioDestination.id, 'mute', e.detail.value)}"
      ></sc-toggle>
    </div>
  `;
}
