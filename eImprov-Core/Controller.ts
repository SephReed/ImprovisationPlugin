



export interface eIControllerArgs {
  define: {
    manufacturer: string;
    productName: string;
    version: string;
    uuid: string;
    author: string;
  },
  ports: {
    in: number;
    out: number;
  }
  portNames: string[] | {
    in: string[];
    out: string[]
  }

}

export abstract class eIController {
  constructor(protected args: eIControllerArgs) {
    this.registerDevice();
  }

  protected registerDevice() {
    const { ports, portNames, define } = this.args;
    const { manufacturer, productName, version, uuid, author } = define;

    host.defineController(manufacturer, productName, version, uuid, author);
    host.defineMidiPorts(ports.in, ports.out); 
    host.addDeviceNameBasedDiscoveryPair(
      Array.isArray(portNames) ? portNames : portNames.in,
      Array.isArray(portNames) ? portNames : portNames.out,
    );
  }

  public init() {
    
  }



  
}