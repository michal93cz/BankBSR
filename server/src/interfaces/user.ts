import { XSDComplexType, XSDElement } from "soap-decorators";

@XSDComplexType
export class LoginInput {

  @XSDElement
  email: string;

  @XSDElement
  password: string;
}

@XSDComplexType
export class LoginResult {

  @XSDElement
  status: string;

  @XSDElement
  token: string;
}
