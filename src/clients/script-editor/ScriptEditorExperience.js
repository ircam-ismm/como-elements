import { AbstractExperience } from '@soundworks/core/client';
import { ifDefined } from 'lit/directives/if-defined.js';
import { render, html } from 'lit/html.js';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';
import '@ircam/simple-components/sc-editor';
import '@ircam/simple-components/sc-text';
import '@ircam/simple-components/sc-button';

// to open from a link (cf. controller)
const OPEN_SCRIPT = (function() {
  const hash = window.location.hash.substring(1);
  if (hash) {
    const sep = '___';
    const parts = hash.split(sep);
    return { type: parts[0], scriptName: parts[1] };
  } else {
    return null;
  }
}());


class PlayerExperience extends AbstractExperience {
  constructor(como, config = {}, $container) {
    super(como.client);

    this.como = como;
    this.config = config;
    this.$container = $container;

    this.currentScript = undefined;

    como.configureExperience(this, {
      'checkin': false,
      'sync': false,
      'platform': false,
      'audio-buffer-loader': false,
    });

    this.currentScript = null;
    // default initialization views
    renderInitializationScreens(como.client, config, $container);
  }

  async start() {
    super.start();

    this.scripts = {
      audio: this.como.experience.plugins['scripts-audio'],
      data: this.como.experience.plugins['scripts-data'],
    };

    // maintain lists
    this.scripts.audio.observe(() => this.render());
    this.scripts.data.observe(() => this.render());

    console.log(this.scripts.audio.getList());

    this.listeners = {
      createScript: async (type, scriptName) => {
        const list = this.scripts[type].getList();

        if (scriptName && list.indexOf(scriptName) === -1) {
          await this.scripts[type].create(scriptName);
          await this.listeners.selectScript(type, scriptName);
        }

        this.render();
      },
      selectScript: async (type, scriptName) => {
        if (this.currentScript) {
          await this.currentScript.detach();
        }

        this.currentScript = await this.scripts[type].attach(scriptName);
        this.currentScript.type = type; // booooooh !!!!

        this.currentScript.subscribe(() => {
          this.render();
        });

        this.currentScript.onDetach(() => {
          this.currentScript = undefined;
          this.render();
        });

        this.render();
      },
      updateScript: async (value) => {
        console.log(value);
        if (this.currentScript) {
          await this.currentScript.setValue(value);
          this.render();
        }
      },
      deleteCurrentScript: async () => {
        const { name: scriptName, type } = this.currentScript;

        // cannot delete the template script (@note, should be more robust)
        if (scriptName === 'default') {
          return;
        }

        await this.scripts[type].delete(scriptName);
        this.render();
      },
    };

    // open from controller
    if (OPEN_SCRIPT) {
      const { type, scriptName } = OPEN_SCRIPT;
      if (this.scripts[type] && this.scripts[type].getList().indexOf(scriptName) !== -1) {
        this.listeners.selectScript(type, scriptName);
      }
    }

    window.addEventListener('resize', () => this.render());
    this.render();
  }

  render() {
    window.cancelAnimationFrame(this.rafId);

    this.rafId = window.requestAnimationFrame(() => {
      const { width, height } = this.$container.getBoundingClientRect();
      const sideBarWidth = 200;

      render(html`
        <div style="position: relative">
          <div class="sidebar"
            style="
              position: absolute;
              left: 0;
              top: 0;
              height: ${height}px;
              width: ${sideBarWidth}px;
              overflow: auto;
              background-color: #565656;
            "
          >
            ${['audio', 'data'].map(type => {
              return html`
                <sc-text readonly value="${type}"></sc-text>
                <sc-text
                  .value=""
                  @change="${e => this.listeners.createScript(type, e.detail.value)}"
                ></sc-text>
                ${this.scripts[type].getList().map(scriptName => {
                  return html`
                    <sc-button
                      value="${scriptName}"
                      @input="${e => this.listeners.selectScript(type, scriptName)}"
                    ></sc-button>
                  `
                })}
              `
            })}
          </div>
          <div
            style="
              margin-left: ${sideBarWidth}px;
              width: ${width - sideBarWidth}px;
              height: ${height}px;
              position: relative;
            "
          >
            <sc-text
              value="${(this.currentScript && this.currentScript.name) || ''}"
              width="${width - 200}"
              height="30"
              readonly
            ></sc-text>
            ${this.currentScript ?
              html`<sc-button
                style="
                  position: absolute;
                  top: 0;
                  right: 0;
                "
                value="delete"
                @release="${e => this.listeners.deleteCurrentScript()}"
              ></sc-button>`
            : ''}
            <sc-editor
              width="${width - sideBarWidth}"
              height="${height - 30}"
              value="${(this.currentScript && this.currentScript.getValue()) || ''}"
              @change="${e => this.listeners.updateScript(e.target.value)}"
            ></sc-editor>
          </div>
        </div>
      `, this.$container);
    });
  }
}

export default PlayerExperience;
