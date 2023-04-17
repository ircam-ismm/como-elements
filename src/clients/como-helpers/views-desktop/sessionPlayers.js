import { html } from 'lit/html.js';
import * as styles from './styles.js';
import { playerControls } from './playerControls';

export function sessionPlayers(data, listeners, {
  sessionId = null,
} = {}) {
  const players = Array.from(data.players.values())
    .filter(player => player.get('sessionId') === sessionId)
    .sort((a, b) => a.get('id') < b.get('id') ? -1 : 1)
    .sort((a, b) => a.get('metas').type === 'designer' ? -1 : 0); // display designers first

  const view = html`
    <h3 style="${styles.h3}">Players</h3>

    ${players.map(player => playerControls(data, listeners, {
      playerId: player.get('id'),
      showMetas: true,
      showRecordingControls: true,
      showDuplicate: true,
      showRecordStream: true,
      showAudioControls: true,
      showScriptsControls: true,
    }))}
  `;

  return view;
}
