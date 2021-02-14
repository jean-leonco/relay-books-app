interface ReloadServerPluginOptions {
  script: string;
}

class ReloadServerPlugin {
  constructor(options?: ReloadServerPluginOptions);
}

const server: import('webpack').Configuration;

export = { ReloadServerPlugin, server };
