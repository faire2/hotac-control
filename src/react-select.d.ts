// react-select 3.x ships without first-party types and `@types/react-select@3.x`
// targets a different React version than our peers. Provide a permissive
// shim so the typed UI can import the legacy default export. The component
// is being kept on the v3 API until the broader UI lib bump.
declare module 'react-select' {
  import type { ComponentType } from 'react';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Select: ComponentType<any>;
  export default Select;
}
