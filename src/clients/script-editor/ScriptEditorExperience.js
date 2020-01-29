import { Experience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import renderAppInitialization from '../views/renderAppInitialization';
import '../views/elements/sw-editor';
import '../views/elements/sw-combo-box';
import '../views/elements/sw-button';


class PlayerExperience extends Experience {
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
    renderAppInitialization(como.client, config, $container);
  }

  async start() {
    super.start();

    this.scriptsAudio = this.como.experience.services['scripts-audio'];
    this.scriptsData = this.como.experience.services['scripts-data'];

    this.scriptsAudio.state.subscribe(updates => this.renderApp());
    this.scriptsData.state.subscribe(updates => this.renderApp());

    this.currentScriptsType = 'audio';
    this.currentScriptService = this.scriptsAudio;
    // // on script list update

    this.eventListeners = {
      setScriptType: async (type) => {
        if (type === 'audio') {
          this.currentScriptsType = 'audio';
          this.currentScriptService = this.scriptsAudio;
        } else if (type === 'data') {
          this.currentScriptsType = 'data';
          this.currentScriptService = this.scriptsData;
        }

        this.currentScript = null;
        this.renderApp();
      },
      createOrSelectScript: async (e) => {
        const scriptName = e.detail.value;
        const list = this.currentScriptService.state.get('list');

        if (list.indexOf(scriptName) === -1) {
          await this.currentScriptService.create(scriptName);
        }

        if (this.currentScript) {
          await this.currentScript.detach();
        }

        this.currentScript = await this.currentScriptService.attach(scriptName);

        this.currentScript.subscribe(() => {
          this.renderApp();
        });

        this.currentScript.onDetach(() => {
          this.currentScript = undefined;
          this.renderApp();
        });

        this.renderApp();
      },
      saveScript: async (e) => {
        if (this.currentScript) {
          await this.currentScript.setValue(e.target.value);
          this.renderApp();
        }
      },
      deleteScript: async (e) => {
        const scriptName = this.currentScript.name;
        console.log(scriptName);

        // @todo - this should be more robust, do it server side ?
        if (scriptName === 'default') {
          // cannot delete the template script
          return;
        }

        await this.currentScriptService.delete(scriptName);
        this.renderApp();
      },
    };

    this.renderApp();
  }

  renderApp() {
    window.cancelAnimationFrame(this.rafId);

    this.rafId = window.requestAnimationFrame(() => {
      const list = this.currentScriptService.state.get('list');

      render(html`
        <div class="screen" style="padding: 20px;">
          <sw-button
            text="Audio Scripts"
            @click="${e => this.eventListeners.setScriptType('audio')}"
          ></sw-button>
          <sw-button
            text="Data Scripts"
            @click="${e => this.eventListeners.setScriptType('data')}"
          ></sw-button>
          <div style="margin-top: 20px;">
            <header
              style="margin-bottom: 12px"
            >
              <h2 class="title">> edit ${this.currentScriptsType} scripts</h2>
              <sw-combo-box
                placeholder="select or create script"
                options="${JSON.stringify(list)}"
                value="${ifDefined((this.currentScript && this.currentScript.name) || undefined)}"
                @change="${this.eventListeners.createOrSelectScript}"
              ></sw-combo-box>
              ${this.currentScript
                ? html`<sw-button
                    @click="${this.eventListeners.deleteScript}"
                    text="delete ${this.currentScript.name}"
                  ></sw-button>`
                : ''
              }
            </header>
            <sw-editor id="test"
              width="800"
              height="400"
              value="${ifDefined((this.currentScript && this.currentScript.getValue()) || undefined)}"
              @save="${this.eventListeners.saveScript}"
            ></sw-editor>
          </div>
        </div>
      `, this.$container);
    });
  }
}

export default PlayerExperience;
