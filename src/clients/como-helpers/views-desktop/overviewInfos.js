import { html } from 'lit/html.js';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-button.js';

export function overviewInfos(data, listeners) {
  return html`
    <div style="
      padding: 10px;
      position: fixed;
      right: 0;
      top: 0;
      text-align: right;
      background-color: #454545;
      z-index: 1000;
    ">
      <span
        style="
          display: inline-block;
          height: 20px;
          line-height: 20px;
          font-size: 12px;
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
          font-size: 12px;
        "
        width="160"
        height="20"
      >#sessions: ${data.sessions.size}</span>
      |
      <sc-button
        width="200"
        height="20"
        value="manage sound files"
        @input="${e => window.open(`./audio-file-manager`, 'audio-file-manager', 'width=1000,height=700')}"
      ></sc-button>
      |
      <span
        style="
          display: inline-block;
          height: 20px;
          line-height: 20px;
          font-size: 12px;
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
