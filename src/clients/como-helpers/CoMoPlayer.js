
/**
 * Simple wrapper around low-level CoMo API:
 * Mainly wrap the default logic to bind player, sessions, graphs and sources together
 */
class CoMoPlayer {
  constructor(como, player) {
    this.como = como;
    this.player = player;
    this.source = null;
    this.session = null;
    this.graph = null;
    this._subscriptions = new Set();

    this.player.subscribe(async updates => {
      for (let name in updates) {
        switch (name) {
          case 'sessionId': {
            await this.createSessionAndGraph(updates[name]);
            break;
          }
        }
      }

      this._emitChange();
    });
  }

  setSource(source) {
    if (this.source && this.graph) {
      this.graph.removeSource(this.source)
    }

    this.source = source;

    if (this.graph) {
      this.graph.setSource(this.source);
    }
  }

  async createSessionAndGraph(sessionId) {
    console.log(sessionId);
    await this.clearSessionAndGraph();

    // if a sessionId is given, attach to the session
    // and create the related graph
    if (sessionId !== null) {
      await this.player.set({ loading: true });
      this.player.onDelete(() => this.clearSessionAndGraph());

      const sessionStateId = this.como.project.sessions.getStateId(sessionId);
      // if the requested sessionId does not exists, abort
      if (sessionStateId === null) {
        return;
      }

      this.session = await this.como.project.sessions.attach(sessionStateId);
      // if session is updated when client is attached to it
      this.session.subscribe((updates) => this._emitChange());
      // if the session is deleted
      this.session.onDelete(() => {
        this.session = null; // we are already detached from state
        this.player.set({ sessionId: null });
      });

      this.graph = await this.como.project.createGraph(this.session, this.player);

      if (this.source) {
        this.graph.setSource(this.source);
      }

      this.player.set({ loading: false });
    }
  }

  async clearSessionAndGraph() {
    if (this.session) {
      await this.session.detach();
      this.session = null;

      if (this.source) {
        this.graph.removeSource(this.source);
      }

      if (this.graph) {
        const graph = this.graph;
        graph.delete();
      }
    }
  }

  onChange(func) {
    this._subscriptions.add(func);

    return () => this._subscriptions.delete(func);
  }

  _emitChange() {
    this._subscriptions.forEach(func => func(this));
  }
}

export default CoMoPlayer;
