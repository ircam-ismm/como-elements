import { AbstractExperience } from '@soundworks/core/server';
import path from 'path';
import open from 'open';

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

    if (client.type === 'controller') {
      client.socket.addListener('open-directory', name => {
        open(path.join(this.como.projectDirectory, name));
      });
    }

    super.enter(client);
  }

  exit(client) {
    this.como.deleteClient(client);

    super.exit(client);
  }
}

export default CoMoExperience;
