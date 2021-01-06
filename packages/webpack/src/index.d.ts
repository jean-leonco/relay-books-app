interface ReloadServerPluginOptions {
  script: string;
}

declare class ReloadServerPlugin {
  constructor(options?: ReloadServerPluginOptions);
}

export = { ReloadServerPlugin };
