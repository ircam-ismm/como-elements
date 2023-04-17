import { html } from 'lit/html.js';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-text.js';

export function sessionLearning(data, listeners, {
  sessionId = null,
} = {}) {
  return ``;
  const session = data.sessions.get(sessionId);
  const learningConfig = session.get('learningConfig');

  console.time('copy examples');
  const examples = session.get('examples'); // this is a problem
  console.timeEnd('copy examples');

  const view = html`
    <div>
      <h3 style="${styles.h3}">ML Config Presets</h3>

      <div>
        ${Object.keys(data.project.learningPresets).map(name => {
          const preset = data.project.learningPresets[name];
          return html`
            <sc-button
              value="${name}"
              @input="${e => listeners.setSessionParams(sessionId, { learningConfig: preset })}"
            ></sc-button>
          `;
        })}
      </div>

      <a style="${styles.openCloseLink}"
        @click="${e => {
          e.preventDefault();
          const $nextSibling = e.target.nextElementSibling;
          const display = $nextSibling.style.display === 'none' ? 'block' : 'none';
          $nextSibling.style.display = display;
        }}"
      >> show config</a>

      <div style="display: none">
        <sc-text
          height="250"
          width="400"
          value="${JSON.stringify(learningConfig, null, 2)}"
          @change="${e => listeners.setSessionParams(sessionId, { learningConfig: JSON.parse(e.detail.value) })}"
        ></sc-text>
      </div>

      <h3 style="${styles.h3}">ML Examples</h3>

      <div>
        <sc-button
          value="clear all examples"
          @input="${e => listeners.deleteSessionExamples(sessionId)}"
        ></sc-button>

        ${Object.values(examples)
          .map(example => example.label)
          .filter((item, index, arr) => arr.indexOf(item) === index)
          .map(label => {
            return html`
              <sc-button
                value="clear ${label}"
                @input="${e => listeners.deleteSessionExamples(sessionId, label)}"
              ></sc-button>
            `;
          })}
      </div>

      <a style="${styles.openCloseLink}"
        @click="${e => {
          e.preventDefault();
          const $nextSibling = e.target.nextElementSibling;
          const display = $nextSibling.style.display === 'none' ? 'block' : 'none';
          $nextSibling.style.display = display;
        }}"
      >> show examples details</a>

      <div style="display: none">
        ${Object.keys(examples).map(exampleUuid => {
          const example = examples[exampleUuid];

          return html`
            <p style="
              height: 20px;
              line-height: 20px;
              margin: 2px 0;
            ">
              <span
                style="
                  display: inline-block;
                  width: 600px;
                  overflow: hidden;
                "
              >
              - ${exampleUuid} (label: ${example.label}, length: ${example.input.length})
              </span>
              <sc-button
                value="delete"
                height="20"
                @input="${e => listeners.deleteSessionExample(sessionId, exampleUuid)}"
              ></sc-button>
            </p>
          `;
        })}
      </div>
    </div>
  `;

  return view;
}
