import { html } from 'lit-html';
import * as styles from './styles.js'

export function createSessions(data, listeners) {
  return html`
    <form
      @submit="${async e => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const sessionName = formData.get('session-name').trim();
        const sessionPreset = formData.get('session-preset');

        if (sessionName && sessionPreset) {
          const sessionId = await listeners.createSession(sessionName, sessionPreset);
          e.target.reset(); // do we need that or can we reset at rendering
        }
      }}"
    >
      <h2 style="${styles.h2}">Create Session:</h2>

      <input
        type="text"
        placeholder="> enter session name"
        name="session-name"
        style="${styles.input}"
      />
      <!-- only display select if more that one preset -->
      <select
        name="session-preset"
        style="
          display: ${data.project.presetNames.length === 1 ? 'none' : 'block'};
        "
      >
        <option>select preset</option>

        ${data.project.presetNames.map(presetName => {
          return html`<option
            value="${presetName}"
            ?selected="${data.project.presetNames.length === 1}"
          >${presetName}</option>`;
        })}
      </select>

      <input
        type="submit"
        value="Create Session"
        style="${styles.button}"
      />
    </form>
  `;
}
