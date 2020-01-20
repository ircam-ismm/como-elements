import { LitElement, html, css } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';

let id = 0;

class SwComboBox extends LitElement {
  static get properties() {
    return {
      width: {
        type: Number
      },
      height: {
        type: Number
      },
      placeholder: {
        type: String,
      },
      options: {
        type: Array,
      },
      value: {
        type: String
      },
    };
  }

  static get styles() {
    return css`
      :host {
        vertical-align: top;
        display: inline-block;
        box-sizing: border-box;
      }

      input {
        box-sizing: border-box;
        color: #ffffff;
        font-family: Consolas, monaco, monospace;
        background-color: #232323;
        border: 1px solid #454545;
        padding: 4px 4px 2px 4px;
        border-radius: 1px;
        width: 200px;
      }

      input:focus {
        outline: none;
        border: 1px solid #656565;
        background-color: #323232;
      }
    `;
  }

  constructor() {
    super();

    this._id = id++;
    this.placeholder = 'choose or create';
    this.options = [];
    this.value = undefined;

    this.width = 200;
    this.height = 30;
  }

  render() {

    return html`
      <input
        style="
          width: ${this.width}px;
          height: ${this.height}px;
          line-height: ${this.height - 6}px;
        "
        list="sw-combo-box-${this._id}"
        .value="${this.value ? this.value : ''}"
        placeholder="${this.placeholder}"
        @change="${this.onChange}"
      />
      <datalist id="sw-combo-box-${this._id}">
        ${this.options.map(option => {
          return html`<option value="${option}">${option}</option>`;
        })}
      </datalist>
    `;
  }

  onChange(e) {
    const event = new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { value: e.target.value.trim() }
    });

    this.dispatchEvent(event);
  }
}

customElements.define('sw-combo-box', SwComboBox);
