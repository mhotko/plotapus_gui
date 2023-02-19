export {};

declare global {
  /**
   * Now declare things that go in the global namespace,
   * or augment existing declarations in the global namespace.
   */
  interface Tab {
    fileName: string;
    fileType: string;
  }

  interface IPostResponse {
    filename: string;
    filetype: string;
  }

  interface IDataRep {
    filename: string;
    cachedData : number[];
    colWidth: number;
    xCol?: number;
  }

  interface IDataReps extends Array<IDataRep>{}


}
