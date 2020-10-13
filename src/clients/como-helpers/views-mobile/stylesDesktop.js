// just for the sake of syntax highlighting...
export const css = str => str;

export const h1 = css`
  font-size: 24px;
`;

export const h2 = css`
  font-size: 14px;
  margin: 10px 0;
`;

export const h3 = css`
  font-size: 12px;
  line-height: 15px;
  color: #cdcdcd;
  font-style: italic;
`;

export const button = css`
  width: 120px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  background-color: #454545;
  color: #ffffff;
  border: 1px solid #989898;
  border-radius: 3px;
  margin: 4px 0;
  vertical-align: top;
`;

export const input = css`
  width: 200px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  border: 1px solid #686868;
  border-radius: 3px;
  padding: 0 6px;
  margin: 4px 0;
  vertical-align: top;
`;

export const select = css`
  width: 100%;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  border: 1px solid #686868;
  border-radius: 3px;
  padding: 0 6px;
  margin: 4px 0;
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
