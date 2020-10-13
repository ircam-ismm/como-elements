import { html } from 'lit-html';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-button.js';

export function overviewInfos(data, listeners) {
  return html`
    <div style="
      margin: 10px;
      position: absolute;
      right: 0;
      text-align: right;
    ">
      <span
        style="
          display: inline-block;
          height: 20px;
          line-height: 20px;
        "
        width="160"
        height="20"
      >#players: ${data.players.size}</span>
      |
      <span
        style="
          display: inline-block;
          height: 20px;
          line-height: 20px;
        "
        width="160"
        height="20"
      >#sessions: ${data.sessions.size}</span>
      |
      <span
        style="
          display: inline-block;
          height: 20px;
          line-height: 20px;
        "
        width="160"
        height="20"
      >layout:</span>
      ${['full', 'clients'].map(layout => {
        return html`
          <sc-button
            width="80"
            height="20"
            value=${layout}
            @input="${e => listeners.setViewOption('layout', layout)}"
          ></sc-button>
        `;
      })}
    </div>
  `;
}
