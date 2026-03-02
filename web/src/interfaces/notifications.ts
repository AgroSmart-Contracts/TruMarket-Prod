export interface INotification {
  id: string;
  message: string;
  subject: string;
  redirectUrl: string;
  read: boolean;
  dealId: string;
}
