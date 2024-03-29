import { html } from 'lit/html.js';
import * as styles from './styles.js';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-toggle.js';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-slider.js';

export function designer(data, listeners, context) {
  const destinationId = data.session.graph.audio.modules.find(m => m.type === 'AudioDestination').id;
  const dataScripts = data.session.graph.data.modules.filter(m => m.type === 'ScriptData');
  const audioScripts = data.session.graph.audio.modules.filter(m => m.type === 'ScriptAudio');
  const playerId = data.player.id;
  const graphOptions = data.player.graphOptions;


  return html`
    <!-- LOADER -->
    ${data.player.loading ?
      html`<div style="${styles.loadingBanner}">loading...</div>` : ''
    }

    <!-- HEADER -->
    <h2 style="${styles.h2}">Session: ${data.session.name}</h2>

    <div style="position: relative; min-height: 50px">
      <div style="
        background-color: #000000;
        display: inline-block;
        line-height: 40px;
        height: 40px;
        width: 40px;
        border: 1px solid #efefef;
        text-align: center;
        font-size: 14px;
      ">${data.player.id}</div>

      <button
        style="
          ${styles.button}
          width: 150px;
          position: absolute;
          font-size: 14px;
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
        .active="${context.coMoPlayer.player.get('graphOptions')[destinationId].mute}"
        @change="${e => listeners.setPlayerGraphOptions(destinationId, { mute: e.detail.value })}"
      ></sc-toggle>
    </div>

    <!-- RECORDING MANAGEMENT -->
    <div style="margin: 10px 0;">
      <h2 style="${styles.h2}">Recording</h2>
      <div>
        ${data.session.labels.length === 0
          ? html`<p>No label available</p>`
          : html`
            <select
              style="${styles.select}; width: calc(100% - 118px);"
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
          `
        }
        <sc-button
          style="position: relative; top: 3px;"
          width="110"
          height="40"
          value="preview"
          .selected="${data.player.preview}"
          @input="${e => listeners.setPlayerParams({ preview: !data.player.preview })}"
        >preview</sc-button>
      </div>

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
                @click="${e => listeners.deleteSessionExamples(label)}"
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
        @click="${e => listeners.deleteSessionExamples()}"
      >clear all labels</button>

      <!-- SWITCH / MUTE SCRIPTS -->
      <button
        style="
          ${styles.button}
          /*background-color: #dc3545;*/
          height: 30px;
          line-height: 30px;
        "
        @click="${e => {
          const $next = e.currentTarget.nextElementSibling;
          const display = $next.style.display === 'none' ? 'block' : 'none';
          $next.style.display = display;
        }}"
      >advanced options</button>
      <div style="display: none; margin-top: 10px;">
        <div style="margin-bottom: 4px;">
          <sc-text
            value="volume"
            width="80"
            readonly
          ></sc-text>
          <sc-slider
            width="150"
            min="-60"
            max="5"
            step="1"
            .value="${graphOptions[destinationId].volume}"
            @input="${e => listeners.setPlayerGraphOptions(destinationId, { volume: e.detail.value })}"
          ></sc-slider>
        </div>
        <div>
          ${audioScripts.map(scriptModule => {
            const scriptOptions = graphOptions[scriptModule.id];

            return html`
              <div style="margin-bottom: 2px; clear : both; ">
                <sc-text
                  value="bypass ${scriptModule.id}"
                  readonly
                ></sc-text>
                <sc-toggle
                  .active="${scriptOptions.bypass}"
                  @change="${e => listeners.setPlayerGraphOptions(scriptModule.id, { bypass: e.detail.value })}"
                ></sc-toggle>
              </div>
            `;
          })}
        </div>
      </div>
    </div>
  `;
}

