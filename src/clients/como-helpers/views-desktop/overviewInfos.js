import { html } from 'lit-html';
import * as styles from './styles.js';

export function overviewInfos(data, listeners) {
  return html`
    <div style="
      margin: 10px;
      position: absolute;
      right: 0;
      text-align: right;
    ">
      <p style="margin: 0 0 10px 0"># sessions: ${data.sessions.size}</p>
      <p style="margin: 0 0 10px 0"># players: ${data.players.size}</p>
    </div>
  `;
}
