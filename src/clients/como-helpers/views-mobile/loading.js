import { html } from 'lit/html.js';
import * as styles from './styles.js'

export function loading(data, listeners) {
  return html`<div>
    <h1 style="
        ${styles.h1}
        margin-top: 200px;
        margin-left: 20px;
      "
    >
      Loading...
    </h1>
  </div>`
}
