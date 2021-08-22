export class UserInfo {
  readonly id: number;
  readonly username: string;
  //readonly token: string;
  readonly authenticationToken: string; // changed so to match Spring's backend
}
