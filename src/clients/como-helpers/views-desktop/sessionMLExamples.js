import { html } from 'lit-html';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-button.js';

export function sessionMLExamples(data, listeners, {
  sessionId = null,
}) {
  const session = data.sessions.get(sessionId).getValues();

  return html`
    <div>
      <h3 style="${styles.h3}">ML Examples</h3>

      <div>
        <sc-button
          value="clear all examples"
          @input="${e => listeners.deleteAllSessionExamples(sessionId)}"
        ></sc-button>

        ${Object.values(session.examples)
          .map(example => example.label)
          .filter((item, index, arr) => arr.indexOf(item) === index)
          .map(label => {
            return html`
              <sc-button
                value="clear ${label}"
                @input="${e => listeners.deleteSessionExamplesByLabel(sessionId, label)}"
              ></sc-button>
            `;
          })}
      </div>

      <a
        style="
          display: inline-block;
          padding: 4px 4px 4px 0;
          margin-top: 12px;
          color: #cdcdcd;
          text-decoration: underline;
          cursor: pointer;
        "
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
