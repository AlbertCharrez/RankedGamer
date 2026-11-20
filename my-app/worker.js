export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request); // serve the built site
  },
};