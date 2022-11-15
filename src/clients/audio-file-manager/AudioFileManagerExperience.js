import { AbstractExperience } from '@soundworks/core/client';
import { render, html } from 'lit/html.js';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';
import '@ircam/simple-components/sc-text';
import '@ircam/simple-components/sc-button';
import '@ircam/simple-components/sc-dragndrop';

class AudioFileManagerExperience extends AbstractExperience {
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
      'scripts-data': false,
      'scripts-audio': false,
      'logger': false,
    });

    this.currentScript = null;
    // default initialization views
    renderInitializationScreens(como.client, config, $container);
  }

  async start() {
    super.start();

    this.filesystem = this.plugins['filesystem'];

    this.filesystem.subscribe(updates => {
      if ('audio' in updates) {
        this.render();
      }
    });

    window.addEventListener('resize', () => this.render());
    this.render();
  }

  render() {
    window.cancelAnimationFrame(this.rafId);

    this.rafId = window.requestAnimationFrame(() => {
      const { width, height } = this.$container.getBoundingClientRect();
      const fileTree = this.filesystem.get('audio');

      render(html`
        <div style="position: relative; padding: 20px;">
          <h1>Project: ${this.como.project.get('name')}</h1>
          <sc-dragndrop
            format="raw"
            @change="${e => this.filesystem.upload('audio', e.detail.value)}"
          ></sc-dragndrop>
          <ul style="list-style-type: none; padding: 0;">
            ${fileTree.children.map(leaf => {
              return html`
                <li style="margin-bottom: 2px;">
                  <sc-text
                    value="${leaf.name}"
                    readonly
                  ></sc-text>
                  <sc-button
                    value="delete"
                    @input="${e => this.filesystem.delete('audio', leaf.name)}"
                  ></sc-button>
                </li>
              `;
            })}
          </ul>


        </div>
      `, this.$container);
    });
  }
}

export default AudioFileManagerExperience;
