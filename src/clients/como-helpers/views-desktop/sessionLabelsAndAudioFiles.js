import { html } from 'lit/html.js';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-toggle.js';

export function sessionLabelsAndAudioFiles(data, listeners, {
  sessionId = null,
} = {}) {
  const session = data.sessions.get(sessionId);
  const labels = session.get('labels');
  const audioFiles = session.get('audioFiles');
  const labelAudioFileTable = session.get('labelAudioFileTable');

  const view = html`
      <a style="${styles.openCloseLink}"
      @click="${e => {
        e.preventDefault();
        const $nextSibling = e.target.nextElementSibling;
        const display = $nextSibling.style.display === 'none' ? 'block' : 'none';
        $nextSibling.style.display = display;
      }}"
    >> manage labels and audio files</a>
    <div style="
      position: relative;
      margin-top: 20px;
      display: none;
      /*display: block;*/
    ">
      <h3 style="${styles.h3}">labels</h3>

      ${labels.map(label => {
        return html`
          <div style="margin-bottom: 2px">
            <sc-text
              value="${label}"
              @change="${e => { if (e.detail.value) {
                listeners.updateSessionLabel(sessionId, label, e.detail.value);
              }}}"
            ></sc-text>
            <sc-button
              text="delete"
              value="${label}"
              @input="${e => listeners.deleteSessionLabel(sessionId, e.detail.value)}"
            ></sc-button>
          </div>
        `;
      })}

      <!-- new label -->
      <div style="margin-bottom: 2px">
        <sc-text
          value="> create new label"
          readonly
        ></sc-text>
        <sc-text
          .value=""
          @change="${e => { if (e.detail.value) {
            listeners.createSessionLabel(sessionId, e.detail.value);
          }}}"
        ></sc-text>
      </div>

      <h3 style="${styles.h3}">audio files</h3>
      ${audioFiles.sort().map(file => {
        return html`
          <div style="margin-bottom: 2px">
            <sc-text
              value="${file.name}"
              readonly
            ></sc-text>
            <sc-toggle
              .active="${file.active}"
              @change="${e => listeners.toggleSessionAudioFile(sessionId, file.name, e.detail.value)}"
            ></sc-toggle>
          </div>
        `;
      })}

      <h3 style="${styles.h3}">labels / audio files table</h3>
      ${labelAudioFileTable.map(row => {
        return html`
          <div style="margin-bottom: 2px">
            <sc-text
              value="${row[0]}"
              readonly
            ></sc-text>
            <sc-text
              value="${row[1]}"
              readonly
            ></sc-text>
            <sc-button
              value="delete"
              @input="${e => listeners.deleteSessionLabelAudioFileRow(sessionId, row) }"
            ></sc-button>
          </div>
        `;
      })}
      <form
        @submit="${e => {
          e.preventDefault();

          const formData = new FormData(e.target);
          const label = formData.get('label');
          const filename = formData.get('filename');

          if (label && filename) {
            listeners.createSessionLabelAudioFileRow(sessionId, [label, filename]);
          }
        }}"
      >
        <select
          name="label"
          style="${styles.select}"
        >
          <option value="">> select label</option>

          ${labels.map(label => {
            return html`<option value="${label}">${label}</option>`;
          })}
        </select>
        <select
          name="filename"
          style="${styles.select}"
        >
          <option value="">> select audio file</option>

          ${audioFiles.sort().filter(f => f.active).map(file => {
            return html`<option value="${file.name}">${file.name}</option>`;
          })}
        </select>
        <input
          type="submit"
          value="create row"
          style="${styles.button}"
        />
      </form>
    </div>
  `;

  return view;
}

