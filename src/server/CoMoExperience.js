import { AbstractExperience } from '@soundworks/core/server';

class CoMoExperience extends AbstractExperience {
  constructor(como) {
    super(como.server, como.clientTypes);

    this.como = como;
    this.como.configureExperience(this);
  }

  async start() {
    super.start();
  }

  enter(client) {
    this.como.addClient(client);

    super.enter(client);
  }

  exit(client) {
    this.como.deleteClient(client);

    super.exit(client);
  }
}

export default CoMoExperience;
