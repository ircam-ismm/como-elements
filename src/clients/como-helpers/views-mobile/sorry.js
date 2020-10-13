import { html } from 'lit-html';
import * as styles from './styles.js'

export function sorry(data, listeners) {
  console.log(data.config);

  return html`<div>
    <h1 style="
        ${styles.h1}
        margin-top: 200px;
        margin-left: 20px;
      "
    >Sorry,</h1>
    <h3 style="
        ${styles.h3}
        margin-top: 30px;
        margin-left: 20px;
      "
    >${data.config.app.name} requires access<br />to the motion sensors to work</h3>
  </div>`
}
