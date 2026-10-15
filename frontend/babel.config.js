// Jest runs CommonJS, where `import.meta` is a syntax error. Vite doesn't use
// this file, so under test swap `import.meta.env` for a dev-mode stand-in.
const viteEnvForJest = ({ types: t }) => ({
  visitor: {
    MemberExpression(path) {
      const { object, property } = path.node;
      if (
        t.isMetaProperty(object) &&
        object.meta.name === 'import' &&
        t.isIdentifier(property, { name: 'env' })
      ) {
        path.replaceWith(t.valueToNode({ DEV: true, PROD: false, MODE: 'test' }));
      }
    },
  },
});

export default (api) => ({
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    ['@babel/preset-react', {runtime: 'automatic'}],
  ],
  plugins: api.env('test') ? [viteEnvForJest] : [],
});
