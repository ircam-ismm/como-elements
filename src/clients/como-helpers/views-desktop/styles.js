// just for the sake of syntax highlighting...
export const css = str => str;

export const h1 = css`
  font-size: 30px;
`;

export const h2 = css`
  font-size: 14px;
  margin: 10px 0;
`;

export const h3 = css`
  font-size: 11px;
  line-height: 15px;
  color: #cdcdcd;
  font-style: italic;
`;

export const button = css`
  width: 200px;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
  color: #ffffff;
  background-color: rgb(39, 40, 34);
  border: 1px solid rgb(61, 62, 57);
  margin: 0;
  vertical-align: top;
`;

export const input = css`
  width: 200px;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
  background-color: rgb(39, 40, 34);
  border: 1px solid rgb(61, 62, 57);
  padding: 0 6px;
  margin: 0;
  vertical-align: top;
  color: white;
`;

export const select = css`
  width: 200px;
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  border: 1px solid #686868;
  border-radius: 3px;
  padding: 0 6px;
  margin: 0;
  vertical-align: top;
`;

export const loadingBanner = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  line-height: 50px;
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.8);
  color: #000000;
  text-align: center;
  z-index: 10;
`;

export const openCloseLink = css`
  display: inline-block;
  padding: 4px 4px 4px 0;
  margin-top: 12px;
  color: #cdcdcd;
  text-decoration: underline;
  cursor: pointer;
`;

export const colorDanger = css`#dc3545`;
export const colorWarning = css`#ffc107`;
export const colorInfo = css`#17a2b8`;
