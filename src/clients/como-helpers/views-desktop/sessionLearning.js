import { html } from 'lit-html';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-text.js';

export function sessionLearning(data, listeners, {
  sessionId = null,
} = {}) {
  const session = data.sessions.get(sessionId).getValues();

  return html`
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
        <pre><code>${JSON.stringify(session.learningConfig, null, 2)}</code></pre>
      </div>

      <h3 style="${styles.h3}">ML Examples</h3>

      <div>
        <sc-button
          value="clear all examples"
          @input="${e => listeners.deleteSessionExamples(sessionId)}"
        ></sc-button>

        ${Object.values(session.examples)
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
        ${Object.keys(session.examples).map(exampleUuid => {
          const example = session.examples[exampleUuid];

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
}
