import { html } from 'lit-html';
import * as styles from './styles.js';
import { playerControls } from './playerControls';

export function sessionPlayers(data, listeners, {
  sessionId = null,
} = {}) {
  const session = data.sessions.get(sessionId).getValues();
  const players = Array.from(data.players.values())
    .filter(player => player.get('sessionId') === session.id)
    .sort((a, b) => a.get('id') < b.get('id') ? -1 : 1)
    .sort((a, b) => a.get('metas').type === 'designer' ? -1 : 0); // display designers first

  return html`
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
}
