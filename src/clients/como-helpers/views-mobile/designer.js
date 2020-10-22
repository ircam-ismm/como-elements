import { html } from 'lit-html';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-toggle.js';
import '@ircam/simple-components/sc-text.js';

export function designer(data, listeners) {
  const destinationId = data.graph.description.audio.modules.find(m => m.type === 'AudioDestination').id;

  return html`
    <!-- LOADER -->
    ${data.player.loading ?
      html`<div style="${styles.loadingBanner}">loading...</div>` : ''
    }

    <!-- HEADER -->
    <h2 style="${styles.h2}">Session: ${data.session.name}</h2>

    <div style="position: relative; min-height: 50px">
      <h3 style="${styles.h3}">PlayerId: ${data.player.id}</h3>

      <button
        style="
          ${styles.button}
          width: 200px;
          position: absolute;
          top: 0px;
          right: 0px;
          margin: 0;
        "
        @click="${e => listeners.setPlayerParams({ sessionId: null })}">
        change session
      </button>
    </div>

    <!-- GRAPH OPTIONS -->
    <div style="margin: 10px 0;">
      <sc-text
        value="mute"
        readonly
      ></sc-text>
      <sc-toggle
        .active="${data.graph.options[destinationId].mute}"
        @change="${e => listeners.setPlayerGraphOptions(destinationId, { mute: e.detail.value })}"
      ></sc-toggle>
    </div>

    <!-- RECORDING MANAGEMENT -->
    <div style="margin: 10px 0;">
      <h2 style="${styles.h2}">Recording</h2>
      <label>
        <!-- @todo - this should also filter "active" files -->
        <select
          style="${styles.select}"
          @change="${e => listeners.setPlayerParams({ label: e.target.value })}"
        >
          ${data.session.labels
            .sort()
            .map(label => {
              return html`
                <option
                  value="${label}"
                  ?selected="${data.player.label === label}"
                >${label}</option>`
            })
          }
        </select>
      </label>

      <div style="height: 96px">
        ${data.player.recordingState === 'idle'
          ? html`<button
              style="
                ${styles.button}
                background-color: #28a745;
                height: 88px;
                line-height: 88px;
              "
              @click="${e => listeners.setPlayerParams({ recordingState: 'armed' })}"
            >record new gesture</button>`
          : ``}

        ${data.player.recordingState === 'armed'
          ? html`<button
              style="
                ${styles.button}
                background-color: #ffc107;
                height: 88px;
                line-height: 88px;
              "
              @click="${e => listeners.setPlayerParams({ recordingState: 'recording' })}"
            >start</button>`
          : ``}

        ${data.player.recordingState === 'recording'
          ? html`<button
              style="
                ${styles.button}
                background-color: #dc3545;
                height: 88px;
                line-height: 88px;
              "
              @click="${e => listeners.setPlayerParams({ recordingState: 'pending' })}"
            >stop</button>`
          : ``}

        ${data.player.recordingState === 'pending'
          ? html`
            <button
                style="
                  ${styles.button}
                  background-color: #007bff;
                "
              @click="${e => listeners.setPlayerParams({ recordingState: 'confirm' })}"
            >save</button>
            <button
                style="
                  ${styles.button}
                "
              @click="${e => listeners.setPlayerParams({ recordingState: 'cancel' })}"
            >cancel</button>`
          : ``}
      </div>
    </div>

    <!-- EXAMPLES MANAGEMENT -->
    <div style="margin: 10px 0">
      <h2 style="${styles.h2}">Gestures</h2>

      ${Object.values(data.session.examples)
        .map(example => example.label)
        .filter((item, index, arr) => arr.indexOf(item) === index)
        .map(label => {
          return html`
            <div style="overflow: auto">
              <span style="
                font-size: 16px;
                display: inline-block;
                height: 30px;
                line-height: 30px;
              ">${label}</span>
              <button
                style="
                  ${styles.button}
                  float: right;
                  width: auto;
                  background-color: #ffc107;
                  height: 30px;
                  line-height: 30px;
                "
                @click="${e => listeners.deleteSessionExamplesByLabel(label)}"
              >delete</button>
            </div>
          `;
        })
      }

      <button
        style="
          ${styles.button}
          background-color: #dc3545;
          height: 30px;
          line-height: 30px;
        "
        @click="${e => listeners.deleteAllSessionExamples()}"
      >clear all labels</button>
    </div>
  `;
}

