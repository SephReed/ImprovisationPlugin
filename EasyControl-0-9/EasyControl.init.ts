import { eIController } from "../eImprov-Core/Controller";
import { eI } from "../eImprov-Core/eImprov";

loadAPI(10);



export class EasyControl extends eIController {
  constructor() {
    super({
      define: {
        manufacturer: "Worlde", 
        productName: "Easy Control 0.9", 
        version: "1.0", 
        uuid: "88ca43e0-8e8e-11ec-b1e5-0800200c9a66",
        author: "Seph Reed",
      },
      ports: {
        in: 1,
        out: 1,
      },
      portNames: ["AAA"]
    })
  }
}


export function init() {
  eI();
  new EasyControl();
}